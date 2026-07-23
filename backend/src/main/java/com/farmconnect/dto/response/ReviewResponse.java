package com.farmconnect.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID orderId,
        String orderNumber,
        String buyerBusinessName,
        int rating,
        String comment,
        Instant createdAt
) {
}
