package com.farmconnect.service;

import com.farmconnect.dto.request.OrderCreateRequest;
import com.farmconnect.dto.request.VerifyPaymentRequest;
import com.farmconnect.dto.response.BuyerOrderDetailResponse;
import com.farmconnect.dto.response.BuyerOrderSummaryResponse;
import com.farmconnect.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface BuyerOrderService {

    BuyerOrderDetailResponse createOrder(UUID userId, OrderCreateRequest request);

    PageResponse<BuyerOrderSummaryResponse> list(UUID userId, String status, Pageable pageable);

    BuyerOrderDetailResponse get(UUID userId, UUID orderId);

    BuyerOrderDetailResponse verifyPayment(UUID userId, UUID orderId, VerifyPaymentRequest request);
}
