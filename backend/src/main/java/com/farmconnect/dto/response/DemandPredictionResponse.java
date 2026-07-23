package com.farmconnect.dto.response;

public record DemandPredictionResponse(
        double predictedDemandNextWeek,
        String unit,
        String trend,
        double confidenceScore,
        double seasonalityFactor,
        String explanation
) {
}
