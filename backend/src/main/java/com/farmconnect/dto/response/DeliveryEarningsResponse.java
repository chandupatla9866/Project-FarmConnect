package com.farmconnect.dto.response;

import java.math.BigDecimal;

public record DeliveryEarningsResponse(
        BigDecimal totalEarnings,
        long totalDeliveries,
        BigDecimal thisWeekEarnings,
        long thisWeekDeliveries
) {
}
