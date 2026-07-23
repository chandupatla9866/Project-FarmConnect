package com.farmconnect.service.impl;

import com.farmconnect.ai.LocalAiService;
import com.farmconnect.client.AiServiceClient;
import com.farmconnect.domain.entity.AiPrediction;
import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.domain.entity.User;
import com.farmconnect.domain.enums.PredictionType;
import com.farmconnect.dto.request.CropRecommendationRequest;
import com.farmconnect.dto.request.DemandPredictionRequest;
import com.farmconnect.dto.request.PricePredictionRequest;
import com.farmconnect.dto.response.*;
import com.farmconnect.exception.BadRequestException;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.AiPredictionRepository;
import com.farmconnect.repository.FarmerRepository;
import com.farmconnect.repository.UserRepository;
import com.farmconnect.service.AiProxyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiProxyServiceImpl implements AiProxyService {

    private final AiServiceClient aiServiceClient;
    private final LocalAiService localAiService;
    private final AiPredictionRepository aiPredictionRepository;
    private final FarmerRepository farmerRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public DemandPredictionResponse predictDemand(UUID userId, DemandPredictionRequest request) {
        Farmer farmer = resolveFarmer(userId);
        DemandPredictionResponse response = aiServiceClient.predictDemand(request);
        persist(PredictionType.DEMAND, farmer, request, response, response.confidenceScore());
        return response;
    }

    @Override
    @Transactional
    public CropRecommendationResponse recommendCrop(UUID userId, CropRecommendationRequest request) {
        Farmer farmer = resolveFarmer(userId);
        CropRecommendationResponse response;
        try {
            response = localAiService.recommendCrop(request);
        } catch (Exception ex) {
            log.warn("Ollama crop recommendation unavailable, falling back to heuristic ai-service: {}", ex.getMessage());
            response = aiServiceClient.recommendCrop(request);
        }
        double avgConfidence = response.recommendedCrops().stream()
                .mapToDouble(CropRecommendationResponse.CropSuggestion::suitabilityScore)
                .average().orElse(0);
        persist(PredictionType.CROP_RECOMMENDATION, farmer, request, response, avgConfidence);
        return response;
    }

    @Override
    @Transactional
    public PricePredictionResponse predictPrice(UUID userId, PricePredictionRequest request) {
        Farmer farmer = resolveFarmer(userId);
        PricePredictionResponse response = aiServiceClient.predictPrice(request);
        persist(PredictionType.PRICE, farmer, request, response, response.confidenceScore());
        return response;
    }

    @Override
    @Transactional
    public DiseaseDetectionResponse detectDisease(UUID userId, MultipartFile image) {
        Farmer farmer = resolveFarmer(userId);
        DiseaseDetectionResponse response;
        try {
            response = localAiService.detectDisease(image);
        } catch (Exception ex) {
            log.warn("Ollama disease detection unavailable, falling back to heuristic ai-service: {}", ex.getMessage());
            response = aiServiceClient.detectDisease(image);
        }
        persist(PredictionType.DISEASE, farmer,
                Map.of("fileName", image.getOriginalFilename() == null ? "unknown" : image.getOriginalFilename(),
                        "sizeBytes", image.getSize()),
                response, response.confidenceScore());
        return response;
    }

    @Override
    @Transactional
    public WeatherAlertResponse getWeatherAlerts(UUID userId, Double lat, Double lon) {
        Farmer farmer = resolveFarmer(userId);

        double latitude = lat != null ? lat : resolveFarmerLatitude(farmer);
        double longitude = lon != null ? lon : resolveFarmerLongitude(farmer);

        WeatherAlertResponse response = aiServiceClient.getWeatherAlerts(latitude, longitude);
        persist(PredictionType.WEATHER, farmer, Map.of("lat", latitude, "lon", longitude), response, null);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AiPredictionHistoryResponse> getHistory(UUID userId, Pageable pageable) {
        Farmer farmer = resolveFarmer(userId);
        return PageResponse.of(aiPredictionRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId(), pageable)
                .map(p -> new AiPredictionHistoryResponse(
                        p.getId(), p.getPredictionType().name(), p.getOutputPayload(), p.getConfidenceScore(), p.getCreatedAt())));
    }

    private double resolveFarmerLatitude(Farmer farmer) {
        if (farmer.getFarmLatitude() == null) {
            throw new BadRequestException("Farm location is not set. Provide lat/lon or update your farm profile first.");
        }
        return farmer.getFarmLatitude().doubleValue();
    }

    private double resolveFarmerLongitude(Farmer farmer) {
        if (farmer.getFarmLongitude() == null) {
            throw new BadRequestException("Farm location is not set. Provide lat/lon or update your farm profile first.");
        }
        return farmer.getFarmLongitude().doubleValue();
    }

    private Farmer resolveFarmer(UUID userId) {
        return farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for current user"));
    }

    private void persist(PredictionType type, Farmer farmer, Object input, Object output, Double confidence) {
        try {
            User requestedBy = userRepository.getReferenceById(farmer.getUser().getId());
            AiPrediction prediction = AiPrediction.builder()
                    .predictionType(type)
                    .requestedBy(requestedBy)
                    .farmer(farmer)
                    .inputPayload(objectMapper.writeValueAsString(input))
                    .outputPayload(objectMapper.writeValueAsString(output))
                    .confidenceScore(confidence != null ? BigDecimal.valueOf(confidence) : null)
                    .build();
            aiPredictionRepository.save(prediction);
        } catch (Exception ex) {
            log.warn("Failed to persist AI prediction audit log for type {}: {}", type, ex.getMessage());
        }
    }
}
