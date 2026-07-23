package com.farmconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PricePredictionRequest(
        @NotBlank String productName,
        @NotBlank String category,
        @NotBlank String region,
        @NotNull @Positive Double quantity,
        String qualityGrade,
        String currentSeason
) {
}
