package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record TopProductResponse(
        UUID productId,
        String productName,
        BigDecimal totalQuantitySold,
        BigDecimal totalRevenue
) {
}
