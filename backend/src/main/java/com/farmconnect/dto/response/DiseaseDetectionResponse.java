package com.farmconnect.dto.response;

public record DiseaseDetectionResponse(
        String detectedCondition,
        double confidenceScore,
        String severity,
        String recommendedAction,
        String affectedCropTypeGuess
) {
}
