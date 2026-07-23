package com.farmconnect.controller;

import com.farmconnect.domain.entity.User;
import com.farmconnect.dto.request.DeliveryProfileUpdateRequest;
import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.DeliveryProfileResponse;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.UserRepository;
import com.farmconnect.security.JwtPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery/me")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DELIVERY')")
public class DeliveryProfileController {

    private final UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<DeliveryProfileResponse>> getProfile(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(toResponse(findUser(principal.userId()))));
    }

    @PutMapping
    @Transactional
    public ResponseEntity<ApiResponse<DeliveryProfileResponse>> updateProfile(
            @AuthenticationPrincipal JwtPrincipal principal, @RequestBody DeliveryProfileUpdateRequest request) {
        User user = findUser(principal.userId());
        if (StringUtils.hasText(request.fullName())) {
            user.setFullName(request.fullName());
        }
        if (StringUtils.hasText(request.phone())) {
            user.setPhone(request.phone());
        }
        return ResponseEntity.ok(ApiResponse.ok(toResponse(userRepository.save(user))));
    }

    private User findUser(java.util.UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }

    private DeliveryProfileResponse toResponse(User user) {
        return new DeliveryProfileResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getProfileImageUrl(), user.isApproved());
    }
}
