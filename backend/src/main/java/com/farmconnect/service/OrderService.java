package com.farmconnect.service;

import com.farmconnect.dto.response.OrderDetailResponse;
import com.farmconnect.dto.response.OrderSummaryResponse;
import com.farmconnect.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface OrderService {

    PageResponse<OrderSummaryResponse> list(UUID userId, String status, Pageable pageable);

    PageResponse<OrderSummaryResponse> history(UUID userId, Pageable pageable);

    OrderDetailResponse get(UUID userId, UUID orderId);

    OrderDetailResponse accept(UUID userId, UUID orderId);

    OrderDetailResponse reject(UUID userId, UUID orderId);

    OrderDetailResponse markReadyForPickup(UUID userId, UUID orderId);
}
