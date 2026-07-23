package com.farmconnect.security;

import java.util.UUID;

public record JwtPrincipal(UUID userId, String email) {
}
