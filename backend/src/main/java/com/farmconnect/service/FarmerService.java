package com.farmconnect.service;

import com.farmconnect.dto.request.FarmerProfileUpdateRequest;
import com.farmconnect.dto.response.FarmerProfileResponse;

import java.util.UUID;

public interface FarmerService {
    FarmerProfileResponse getProfile(UUID userId);

    FarmerProfileResponse updateProfile(UUID userId, FarmerProfileUpdateRequest request);
}
