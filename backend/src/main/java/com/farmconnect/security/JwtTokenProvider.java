package com.farmconnect.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final long onboardingExpirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs,
            @Value("${app.jwt.onboarding-expiration-ms}") long onboardingExpirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.onboardingExpirationMs = onboardingExpirationMs;
    }

    public String generateAccessToken(UUID userId, String email, Set<String> roles) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId.toString())
                .claim("roles", roles)
                .claim("onboarding", false)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(signingKey)
                .compact();
    }

    public String generateOnboardingToken(UUID userId, String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId.toString())
                .claim("roles", List.of())
                .claim("onboarding", true)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + onboardingExpirationMs))
                .signWith(signingKey)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("Invalid JWT: {}", ex.getMessage());
            return false;
        }
    }

    public Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }

    public UUID getUserId(Claims claims) {
        return UUID.fromString(claims.get("userId", String.class));
    }

    public String getEmail(Claims claims) {
        return claims.getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(Claims claims) {
        return claims.get("roles", List.class);
    }

    public boolean isOnboarding(Claims claims) {
        return Boolean.TRUE.equals(claims.get("onboarding", Boolean.class));
    }
}
