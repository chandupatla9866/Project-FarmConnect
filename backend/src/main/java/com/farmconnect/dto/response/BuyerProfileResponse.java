package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BuyerProfileResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String profileImageUrl,
        String buyerType,
        String businessName,
        String deliveryAddress,
        String city,
        String state,
        String pincode,
        BigDecimal latitude,
        BigDecimal longitude,
        String gstNumber,
        Instant createdAt
) {
}
