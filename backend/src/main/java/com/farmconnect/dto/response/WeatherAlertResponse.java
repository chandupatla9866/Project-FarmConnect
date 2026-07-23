package com.farmconnect.dto.response;

import java.util.List;

public record WeatherAlertResponse(
        String region,
        String currentCondition,
        double tempCelsius,
        double humidityPercent,
        List<WeatherAlertItem> alerts,
        String forecastSummary
) {
    public record WeatherAlertItem(String type, String severity, String message, String validUntil) {
    }
}
