package com.farmconnect.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DemandPredictionRequest(
        @NotBlank String productCategory,
        @NotBlank String region,
        String season
) {
}
