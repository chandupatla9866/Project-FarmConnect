package com.farmconnect.dto.response;

import java.math.BigDecimal;

public record PlatformAnalyticsResponse(
        long totalFarmers,
        long verifiedFarmers,
        long totalBuyers,
        long totalProducts,
        long activeProducts,
        long totalOrders,
        long pendingOrders,
        long deliveredOrders,
        BigDecimal totalRevenue
) {
}
