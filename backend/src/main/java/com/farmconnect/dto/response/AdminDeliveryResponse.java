package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminDeliveryResponse(
        UUID id,
        String orderNumber,
        String farmName,
        String buyerBusinessName,
        String partnerName,
        String status,
        BigDecimal deliveryFee,
        Instant createdAt
) {
}
