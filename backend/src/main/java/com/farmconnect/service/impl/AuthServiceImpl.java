package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.Buyer;
import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.domain.entity.Role;
import com.farmconnect.domain.entity.User;
import com.farmconnect.domain.enums.AuthProvider;
import com.farmconnect.domain.enums.BuyerType;
import com.farmconnect.domain.enums.RoleName;
import com.farmconnect.dto.request.LoginRequest;
import com.farmconnect.dto.request.RegisterRequest;
import com.farmconnect.dto.request.SelectRoleRequest;
import com.farmconnect.dto.response.AuthResponse;
import com.farmconnect.dto.response.UserSummaryResponse;
import com.farmconnect.exception.BadRequestException;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.BuyerRepository;
import com.farmconnect.repository.FarmerRepository;
import com.farmconnect.repository.RoleRepository;
import com.farmconnect.repository.UserRepository;
import com.farmconnect.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements com.farmconnect.service.AuthService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final FarmerRepository farmerRepository;
    private final BuyerRepository buyerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .authProvider(AuthProvider.LOCAL)
                .enabled(true)
                .approved(!"DELIVERY".equalsIgnoreCase(request.role()))
                .build();

        Role role = resolveRole(request.role());
        user.setRoles(new HashSet<>(Set.of(role)));
        user = userRepository.save(user);

        provisionRoleProfile(user, request.role(), request.buyerType(), request.businessName());

        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        return toSummary(user);
    }

    @Override
    @Transactional
    public AuthResponse selectRole(String onboardingToken, SelectRoleRequest request) {
        String token = stripBearer(onboardingToken);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid or expired onboarding token");
        }
        Claims claims = jwtTokenProvider.parseClaims(token);
        if (!jwtTokenProvider.isOnboarding(claims)) {
            throw new BadRequestException("This endpoint requires an onboarding token");
        }

        User user = userRepository.findById(jwtTokenProvider.getUserId(claims))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRoles().isEmpty()) {
            throw new BadRequestException("Role has already been assigned to this account");
        }

        Role role = resolveRole(request.role());
        user.setRoles(new HashSet<>(Set.of(role)));
        if ("DELIVERY".equalsIgnoreCase(request.role())) {
            user.setApproved(false);
        }
        user = userRepository.save(user);

        provisionRoleProfile(user, request.role(), request.buyerType(), request.businessName());

        return buildAuthResponse(user);
    }

    private void provisionRoleProfile(User user, String role, String buyerType, String businessName) {
        if ("FARMER".equalsIgnoreCase(role)) {
            if (!farmerRepository.existsByUserId(user.getId())) {
                Farmer farmer = Farmer.builder()
                        .user(user)
                        .farmName(user.getFullName() + "'s Farm")
                        .verified(false)
                        .build();
                farmerRepository.save(farmer);
            }
        } else if ("BUYER".equalsIgnoreCase(role)) {
            if (!buyerRepository.existsByUserId(user.getId())) {
                if (!StringUtils.hasText(buyerType)) {
                    throw new BadRequestException("buyerType is required when role is BUYER");
                }
                BuyerType type;
                try {
                    type = BuyerType.valueOf(buyerType.toUpperCase());
                } catch (IllegalArgumentException ex) {
                    throw new BadRequestException("buyerType must be APARTMENT_COMMUNITY or RESTAURANT");
                }
                Buyer buyer = Buyer.builder()
                        .user(user)
                        .buyerType(type)
                        .businessName(StringUtils.hasText(businessName) ? businessName : user.getFullName())
                        .build();
                buyerRepository.save(buyer);
            }
        }
    }

    private Role resolveRole(String role) {
        RoleName roleName;
        if ("FARMER".equalsIgnoreCase(role)) {
            roleName = RoleName.ROLE_FARMER;
        } else if ("DELIVERY".equalsIgnoreCase(role)) {
            roleName = RoleName.ROLE_DELIVERY;
        } else {
            roleName = RoleName.ROLE_BUYER;
        }
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role not seeded: " + roleName));
    }

    private AuthResponse buildAuthResponse(User user) {
        Set<String> roleNames = user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet());
        String token = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), roleNames);
        return new AuthResponse(token, toSummary(user));
    }

    private UserSummaryResponse toSummary(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getProfileImageUrl(),
                user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()),
                user.isApproved()
        );
    }

    private String stripBearer(String header) {
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length());
        }
        return header;
    }
}
