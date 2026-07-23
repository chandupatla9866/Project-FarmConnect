package com.farmconnect.service;

import com.farmconnect.dto.response.AnalyticsSummaryResponse;
import com.farmconnect.dto.response.RevenueTrendPoint;
import com.farmconnect.dto.response.TopProductResponse;

import java.util.List;
import java.util.UUID;

public interface AnalyticsService {

    AnalyticsSummaryResponse summary(UUID userId);

    List<RevenueTrendPoint> revenueTrend(UUID userId, String range);

    List<TopProductResponse> topProducts(UUID userId, int limit);
}
