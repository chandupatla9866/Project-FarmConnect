package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AiPredictionHistoryResponse(
        UUID id,
        String predictionType,
        String outputPayload,
        BigDecimal confidenceScore,
        Instant createdAt
) {
}
