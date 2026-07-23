package com.farmconnect.service;

import com.farmconnect.dto.response.BuyerProductResponse;
import com.farmconnect.dto.response.FarmerSummaryResponse;
import com.farmconnect.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface BuyerBrowseService {

    PageResponse<BuyerProductResponse> browseProducts(
            UUID userId, String search, UUID categoryId, UUID farmerId, Boolean organic, Pageable pageable);

    BuyerProductResponse getProduct(UUID userId, UUID productId);

    PageResponse<FarmerSummaryResponse> browseFarmers(UUID userId, String search, boolean nearbyOnly, Pageable pageable);

    FarmerSummaryResponse getFarmer(UUID userId, UUID farmerId);
}
