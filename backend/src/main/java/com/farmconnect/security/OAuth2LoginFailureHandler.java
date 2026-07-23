package com.farmconnect.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Without this, any failure during the Google OAuth2 handshake (denied consent, token
 * exchange error, provider outage) falls through to Spring Security's default behavior:
 * a redirect to this API-only backend's bare /login, which has no page behind it and
 * 404s/500s with raw JSON instead of taking the user anywhere useful. This sends them
 * back to the real frontend login page with a query param the SPA can show as a toast.
 */
@Slf4j
@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                         AuthenticationException exception) throws IOException {
        log.warn("Google OAuth2 login failed: {}", exception.getMessage());
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl + "/login")
                .queryParam("oauth_error", "true")
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
