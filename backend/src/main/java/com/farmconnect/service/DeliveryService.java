package com.farmconnect.service;

import com.farmconnect.dto.request.OtpVerifyRequest;
import com.farmconnect.dto.response.DeliveryEarningsResponse;
import com.farmconnect.dto.response.DeliveryResponse;
import com.farmconnect.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface DeliveryService {

    PageResponse<DeliveryResponse> listAvailable(Pageable pageable);

    PageResponse<DeliveryResponse> listMine(UUID userId, String status, Pageable pageable);

    PageResponse<DeliveryResponse> history(UUID userId, Pageable pageable);

    DeliveryResponse get(UUID userId, UUID deliveryId);

    DeliveryResponse claim(UUID userId, UUID deliveryId);

    DeliveryResponse markPickedUp(UUID userId, UUID deliveryId);

    DeliveryResponse completeDelivery(UUID userId, UUID deliveryId, OtpVerifyRequest request);

    DeliveryEarningsResponse earnings(UUID userId);
}
