package com.farmconnect.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemCreateRequest(
        @NotNull UUID productId,
        @NotNull @Positive BigDecimal quantity
) {
}
