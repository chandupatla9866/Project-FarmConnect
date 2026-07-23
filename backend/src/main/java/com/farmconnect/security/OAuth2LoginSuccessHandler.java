package com.farmconnect.security;

import com.farmconnect.domain.entity.User;
import com.farmconnect.domain.enums.AuthProvider;
import com.farmconnect.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.stream.Collectors;

/**
 * Bridges Spring Security's OAuth2 login flow into FarmConnect's own JWT scheme.
 * New Google sign-ins have no role yet, so they're routed to a short-lived
 * onboarding token + a role-selection screen instead of a full access token.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String providerId = oAuth2User.getName();
        String email = oAuth2User.getAttribute("email");
        String fullName = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        User user = userRepository.findByAuthProviderAndProviderId(AuthProvider.GOOGLE, providerId)
                .or(() -> userRepository.findByEmailIgnoreCase(email))
                .orElseGet(() -> User.builder()
                        .fullName(fullName != null ? fullName : email)
                        .email(email)
                        .authProvider(AuthProvider.GOOGLE)
                        .providerId(providerId)
                        .profileImageUrl(picture)
                        .enabled(true)
                        .build());

        if (user.getAuthProvider() != AuthProvider.GOOGLE || user.getProviderId() == null) {
            user.setAuthProvider(AuthProvider.GOOGLE);
            user.setProviderId(providerId);
        }
        user = userRepository.save(user);

        String redirectUrl;
        if (user.getRoles().isEmpty()) {
            String onboardingToken = jwtTokenProvider.generateOnboardingToken(user.getId(), user.getEmail());
            redirectUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl + "/onboarding/select-role")
                    .queryParam("token", onboardingToken)
                    .toUriString();
        } else {
            var roleNames = user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet());
            String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), roleNames);
            redirectUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl + "/oauth/callback")
                    .queryParam("token", accessToken)
                    .toUriString();
        }

        response.sendRedirect(redirectUrl);
    }
}
