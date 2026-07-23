package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record BuyerOrderDetailResponse(
        UUID id,
        String orderNumber,
        UUID farmerId,
        String farmName,
        String farmCity,
        String status,
        BigDecimal totalAmount,
        String deliveryAddress,
        LocalDate expectedDeliveryDate,
        String notes,
        List<OrderItemResponse> items,
        boolean reviewed,
        String deliveryOtp,
        String paymentMethod,
        String paymentStatus,
        // Only present when an online payment is awaiting completion - the frontend
        // uses these to open the Razorpay Checkout widget.
        String razorpayOrderId,
        String razorpayKeyId,
        Instant createdAt,
        Instant updatedAt
) {
}
