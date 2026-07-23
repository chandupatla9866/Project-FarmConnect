package com.farmconnect.client;

import com.farmconnect.dto.request.CropRecommendationRequest;
import com.farmconnect.dto.request.DemandPredictionRequest;
import com.farmconnect.dto.request.PricePredictionRequest;
import com.farmconnect.dto.response.CropRecommendationResponse;
import com.farmconnect.dto.response.DemandPredictionResponse;
import com.farmconnect.dto.response.DiseaseDetectionResponse;
import com.farmconnect.dto.response.PricePredictionResponse;
import com.farmconnect.dto.response.WeatherAlertResponse;
import com.farmconnect.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Calls the Python heuristic ai-service. Demand/price/weather always go through here.
 * Crop recommendation and disease detection normally go through LocalAiService (real
 * Ollama-backed vision/reasoning) instead - this client's recommendCrop/detectDisease
 * exist as the heuristic fallback AiProxyServiceImpl uses when Ollama isn't reachable
 * (e.g. in a deployment that doesn't self-host Ollama).
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

    public CropRecommendationResponse recommendCrop(CropRecommendationRequest request) {
        return post("/recommend/crop", request, CropRecommendationResponse.class);
    }

    public DiseaseDetectionResponse detectDisease(MultipartFile image) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        try {
            builder.part("image", image.getBytes())
                    .filename(image.getOriginalFilename() != null ? image.getOriginalFilename() : "upload.jpg")
                    .contentType(MediaType.parseMediaType(image.getContentType() != null ? image.getContentType() : "image/jpeg"));
        } catch (IOException ex) {
            throw new BadRequestException("Failed to read uploaded image: " + ex.getMessage());
        }
        return aiServiceRestClient.post()
                .uri("/detect/disease")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(builder.build())
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleError)
                .body(DiseaseDetectionResponse.class);
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
