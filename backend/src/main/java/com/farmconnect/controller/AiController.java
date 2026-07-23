package com.farmconnect.controller;

import com.farmconnect.dto.request.CropRecommendationRequest;
import com.farmconnect.dto.request.DemandPredictionRequest;
import com.farmconnect.dto.request.PricePredictionRequest;
import com.farmconnect.dto.response.*;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.AiProxyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class AiController {

    private final AiProxyService aiProxyService;

    @PostMapping("/demand-prediction")
    public ResponseEntity<ApiResponse<DemandPredictionResponse>> predictDemand(
            @AuthenticationPrincipal JwtPrincipal principal, @Valid @RequestBody DemandPredictionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(aiProxyService.predictDemand(principal.userId(), request)));
    }

    @PostMapping("/crop-recommendation")
    public ResponseEntity<ApiResponse<CropRecommendationResponse>> recommendCrop(
            @AuthenticationPrincipal JwtPrincipal principal, @Valid @RequestBody CropRecommendationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(aiProxyService.recommendCrop(principal.userId(), request)));
    }

    @PostMapping("/price-prediction")
    public ResponseEntity<ApiResponse<PricePredictionResponse>> predictPrice(
            @AuthenticationPrincipal JwtPrincipal principal, @Valid @RequestBody PricePredictionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(aiProxyService.predictPrice(principal.userId(), request)));
    }

    @PostMapping(value = "/disease-detection", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<DiseaseDetectionResponse>> detectDisease(
            @AuthenticationPrincipal JwtPrincipal principal, @RequestParam MultipartFile image) {
        return ResponseEntity.ok(ApiResponse.ok(aiProxyService.detectDisease(principal.userId(), image)));
    }

    @GetMapping("/weather-alerts")
    public ResponseEntity<ApiResponse<WeatherAlertResponse>> weatherAlerts(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        return ResponseEntity.ok(ApiResponse.ok(aiProxyService.getWeatherAlerts(principal.userId(), lat, lon)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PageResponse<AiPredictionHistoryResponse>>> history(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(aiProxyService.getHistory(principal.userId(), pageable)));
    }
}
