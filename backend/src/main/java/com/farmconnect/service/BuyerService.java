package com.farmconnect.service;

import com.farmconnect.dto.request.BuyerProfileUpdateRequest;
import com.farmconnect.dto.response.BuyerProfileResponse;

import java.util.UUID;

public interface BuyerService {
    BuyerProfileResponse getProfile(UUID userId);

    BuyerProfileResponse updateProfile(UUID userId, BuyerProfileUpdateRequest request);
}
