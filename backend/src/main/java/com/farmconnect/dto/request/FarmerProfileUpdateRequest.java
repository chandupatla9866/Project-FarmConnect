package com.farmconnect.dto.request;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record FarmerProfileUpdateRequest(
        @Size(max = 150) String fullName,
        String phone,
        @Size(max = 150) String farmName,
        @Size(max = 255) String farmAddress,
        @Size(max = 100) String farmCity,
        @Size(max = 100) String farmState,
        @Size(max = 12) String farmPincode,
        BigDecimal farmSizeAcres,
        Integer farmingExperienceYears,
        @Size(max = 500) String primaryCropTypes,
        String bio,
        BigDecimal farmLatitude,
        BigDecimal farmLongitude
) {
}
