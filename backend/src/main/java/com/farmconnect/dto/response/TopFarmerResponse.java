package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record TopFarmerResponse(
        UUID farmerId,
        String farmName,
        BigDecimal totalRevenue,
        long totalOrders
) {
}
