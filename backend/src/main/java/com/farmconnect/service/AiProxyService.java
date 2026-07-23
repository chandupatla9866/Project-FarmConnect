package com.farmconnect.service;

import com.farmconnect.dto.request.CropRecommendationRequest;
import com.farmconnect.dto.request.DemandPredictionRequest;
import com.farmconnect.dto.request.PricePredictionRequest;
import com.farmconnect.dto.response.*;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface AiProxyService {

    DemandPredictionResponse predictDemand(UUID userId, DemandPredictionRequest request);

    CropRecommendationResponse recommendCrop(UUID userId, CropRecommendationRequest request);

    PricePredictionResponse predictPrice(UUID userId, PricePredictionRequest request);

    DiseaseDetectionResponse detectDisease(UUID userId, MultipartFile image);

    WeatherAlertResponse getWeatherAlerts(UUID userId, Double lat, Double lon);

    PageResponse<AiPredictionHistoryResponse> getHistory(UUID userId, Pageable pageable);
}
