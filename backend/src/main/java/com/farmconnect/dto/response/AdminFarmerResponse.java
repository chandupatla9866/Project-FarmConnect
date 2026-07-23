package com.farmconnect.dto.response;

import java.time.Instant;
import java.util.UUID;

public record AdminFarmerResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String farmName,
        String farmCity,
        String farmState,
        boolean verified,
        boolean enabled,
        long productCount,
        Instant createdAt
) {
}
