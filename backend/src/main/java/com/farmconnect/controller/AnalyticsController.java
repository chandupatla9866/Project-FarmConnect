package com.farmconnect.controller;

import com.farmconnect.dto.response.AnalyticsSummaryResponse;
import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.RevenueTrendPoint;
import com.farmconnect.dto.response.TopProductResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> summary(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.summary(principal.userId())));
    }

    @GetMapping("/revenue-trend")
    public ResponseEntity<ApiResponse<List<RevenueTrendPoint>>> revenueTrend(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(defaultValue = "weekly") String range) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.revenueTrend(principal.userId(), range)));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> topProducts(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.topProducts(principal.userId(), limit)));
    }
}
