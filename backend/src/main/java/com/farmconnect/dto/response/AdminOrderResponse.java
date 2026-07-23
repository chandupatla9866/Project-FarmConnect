package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminOrderResponse(
        UUID id,
        String orderNumber,
        String buyerBusinessName,
        String farmName,
        String status,
        BigDecimal totalAmount,
        int itemCount,
        Instant createdAt
) {
}
