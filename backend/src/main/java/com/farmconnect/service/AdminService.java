package com.farmconnect.service;

import com.farmconnect.dto.response.*;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AdminService {

    PageResponse<AdminFarmerResponse> listFarmers(String search, Boolean verifiedOnly, Pageable pageable);

    AdminFarmerDetailResponse getFarmerDetail(UUID farmerId);

    AdminFarmerResponse setFarmerVerified(UUID farmerId, boolean verified);

    AdminFarmerResponse setFarmerEnabled(UUID farmerId, boolean enabled);

    PageResponse<AdminBuyerResponse> listBuyers(String search, Pageable pageable);

    AdminBuyerResponse setBuyerEnabled(UUID buyerId, boolean enabled);

    PageResponse<AdminDeliveryPartnerResponse> listDeliveryPartners(String search, Boolean approvedOnly, Pageable pageable);

    AdminDeliveryPartnerResponse setDeliveryPartnerApproved(UUID userId, boolean approved);

    AdminDeliveryPartnerResponse setDeliveryPartnerEnabled(UUID userId, boolean enabled);

    PageResponse<AdminProductResponse> listProducts(String search, String status, Pageable pageable);

    AdminProductResponse setProductStatus(UUID productId, String status);

    PageResponse<AdminOrderResponse> listOrders(String status, Pageable pageable);

    PageResponse<AdminDeliveryResponse> listDeliveries(String status, Pageable pageable);

    PlatformAnalyticsResponse analyticsSummary();

    java.util.List<RevenueTrendPoint> revenueTrend(String range);

    java.util.List<TopFarmerResponse> topFarmers(int limit);
}
