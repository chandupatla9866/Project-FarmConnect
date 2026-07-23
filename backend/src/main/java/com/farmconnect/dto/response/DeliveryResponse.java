package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record DeliveryResponse(
        UUID id,
        UUID orderId,
        String orderNumber,
        String buyerBusinessName,
        String farmName,
        String pickupAddress,
        String dropAddress,
        String status,
        BigDecimal estimatedDistanceKm,
        BigDecimal deliveryFee,
        boolean claimed,
        Instant pickupTime,
        Instant deliveryTime,
        Instant createdAt
) {
}
