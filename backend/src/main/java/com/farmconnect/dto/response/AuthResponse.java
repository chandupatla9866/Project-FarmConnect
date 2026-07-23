package com.farmconnect.dto.response;

public record AuthResponse(String token, UserSummaryResponse user) {
}
