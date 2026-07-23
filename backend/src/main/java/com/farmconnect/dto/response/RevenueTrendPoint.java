package com.farmconnect.dto.response;

import java.math.BigDecimal;

public record RevenueTrendPoint(String label, BigDecimal revenue, long orders) {
}
