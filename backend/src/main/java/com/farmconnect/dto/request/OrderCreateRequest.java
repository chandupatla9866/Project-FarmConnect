package com.farmconnect.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrderCreateRequest(
        @NotNull UUID farmerId,
        @NotEmpty @Valid List<OrderItemCreateRequest> items,
        String deliveryAddress,
        LocalDate expectedDeliveryDate,
        String notes,
        // "COD" or "RAZORPAY" - blank defaults to COD
        String paymentMethod
) {
}
