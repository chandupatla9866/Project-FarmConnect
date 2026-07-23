package com.farmconnect.dto.response;

import java.time.Instant;
import java.util.UUID;

public record AdminBuyerResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String buyerType,
        String businessName,
        String city,
        boolean enabled,
        Instant createdAt
) {
}
