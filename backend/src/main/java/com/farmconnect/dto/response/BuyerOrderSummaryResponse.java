package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record BuyerOrderSummaryResponse(
        UUID id,
        String orderNumber,
        UUID farmerId,
        String farmName,
        String status,
        BigDecimal totalAmount,
        String deliveryAddress,
        LocalDate expectedDeliveryDate,
        int itemCount,
        Instant createdAt
) {
}
