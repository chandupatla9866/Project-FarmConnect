package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminProductResponse(
        UUID id,
        String name,
        String categoryName,
        UUID farmerId,
        String farmName,
        String imageUrl,
        BigDecimal pricePerUnit,
        BigDecimal quantityAvailable,
        boolean organic,
        String status,
        Instant createdAt
) {
}
