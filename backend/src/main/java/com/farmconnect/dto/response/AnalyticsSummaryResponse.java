package com.farmconnect.dto.response;

import java.math.BigDecimal;

public record AnalyticsSummaryResponse(
        BigDecimal totalRevenue,
        long totalOrders,
        BigDecimal averageOrderValue,
        long pendingOrders,
        long activeProducts
) {
}
