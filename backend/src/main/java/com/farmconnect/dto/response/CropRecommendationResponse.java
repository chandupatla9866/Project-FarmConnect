package com.farmconnect.dto.response;

import java.util.List;

public record CropRecommendationResponse(
        List<CropSuggestion> recommendedCrops,
        String generatedAt
) {
    public record CropSuggestion(
            String cropName,
            double suitabilityScore,
            double expectedYieldPerAcre,
            double expectedMarketPricePerUnit,
            String reason
    ) {
    }
}
