package com.farmconnect.dto.request;

import java.math.BigDecimal;

public record BuyerProfileUpdateRequest(
        String fullName,
        String phone,
        String businessName,
        String deliveryAddress,
        String city,
        String state,
        String pincode,
        BigDecimal latitude,
        BigDecimal longitude,
        String gstNumber
) {
}
