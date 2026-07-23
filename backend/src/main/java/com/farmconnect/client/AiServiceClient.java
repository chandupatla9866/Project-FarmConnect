package com.farmconnect.client;

import com.farmconnect.dto.request.DemandPredictionRequest;
import com.farmconnect.dto.request.PricePredictionRequest;
import com.farmconnect.dto.response.DemandPredictionResponse;
import com.farmconnect.dto.response.PricePredictionResponse;
import com.farmconnect.dto.response.WeatherAlertResponse;
import com.farmconnect.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.IOException;

/**
 * Calls the Python heuristic ai-service for the features still backed by it (demand,
 * price, weather). Crop recommendation and disease detection moved to LocalAiService
 * (real Ollama-backed vision/reasoning) - see com.farmconnect.ai.LocalAiService.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiServiceClient {

    private final RestClient aiServiceRestClient;

    public DemandPredictionResponse predictDemand(DemandPredictionRequest request) {
        return post("/predict/demand", request, DemandPredictionResponse.class);
    }

    public PricePredictionResponse predictPrice(PricePredictionRequest request) {
        return post("/predict/price", request, PricePredictionResponse.class);
    }

    public WeatherAlertResponse getWeatherAlerts(double lat, double lon) {
        return aiServiceRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/alerts/weather")
                        .queryParam("lat", lat)
                        .queryParam("lon", lon)
                        .build())
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleError)
                .body(WeatherAlertResponse.class);
    }

    private <T> T post(String uri, Object requestBody, Class<T> responseType) {
        return aiServiceRestClient.post()
                .uri(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleError)
                .body(responseType);
    }

    private void handleError(org.springframework.http.HttpRequest request,
                              org.springframework.http.client.ClientHttpResponse response) throws IOException {
        log.error("AI service call failed with status {}", response.getStatusCode());
        throw new BadRequestException("AI service is currently unavailable. Please try again shortly.");
    }
}
