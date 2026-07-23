package com.farmconnect.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CropRecommendationRequest(
        @NotBlank String soilType,
        @NotBlank String region,
        @NotBlank String season,
        Double farmSizeAcres,
        String waterAvailability
) {
}
