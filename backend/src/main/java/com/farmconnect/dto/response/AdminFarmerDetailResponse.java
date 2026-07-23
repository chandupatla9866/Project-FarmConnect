package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminFarmerDetailResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String farmName,
        String farmAddress,
        String farmCity,
        String farmState,
        String farmPincode,
        BigDecimal farmSizeAcres,
        Integer farmingExperienceYears,
        String primaryCropTypes,
        String bio,
        BigDecimal farmLatitude,
        BigDecimal farmLongitude,
        boolean verified,
        boolean enabled,
        Instant createdAt,
        List<AdminProductResponse> products
) {
}
