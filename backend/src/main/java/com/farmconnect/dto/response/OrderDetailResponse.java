package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrderDetailResponse(
        UUID id,
        String orderNumber,
        String buyerBusinessName,
        String buyerType,
        String status,
        BigDecimal totalAmount,
        String deliveryAddress,
        LocalDate expectedDeliveryDate,
        String notes,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {
}
