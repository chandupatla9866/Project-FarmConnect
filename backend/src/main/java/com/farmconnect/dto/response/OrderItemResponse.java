package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID productId,
        String productName,
        String unit,
        BigDecimal quantity,
        BigDecimal pricePerUnitAtOrder,
        BigDecimal subtotal
) {
}
