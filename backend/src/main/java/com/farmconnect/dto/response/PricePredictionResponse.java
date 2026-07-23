package com.farmconnect.dto.response;

import java.util.List;

public record PricePredictionResponse(
        double predictedPricePerUnit,
        double priceRangeMin,
        double priceRangeMax,
        List<String> marketFactorsConsidered,
        double confidenceScore
) {
}
