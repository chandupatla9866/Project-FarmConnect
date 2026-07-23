package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record FarmerSummaryResponse(
        UUID id,
        String farmName,
        String farmCity,
        String farmState,
        String primaryCropTypes,
        String bio,
        boolean verified,
        BigDecimal farmLatitude,
        BigDecimal farmLongitude,
        long activeProductCount,
        Double distanceKm
) {
}
