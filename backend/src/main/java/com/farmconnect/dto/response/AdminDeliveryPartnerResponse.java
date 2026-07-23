package com.farmconnect.dto.response;

import java.time.Instant;
import java.util.UUID;

public record AdminDeliveryPartnerResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        boolean approved,
        boolean enabled,
        long deliveriesCompleted,
        Instant createdAt
) {
}
