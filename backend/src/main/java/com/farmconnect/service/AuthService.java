package com.farmconnect.service;

import com.farmconnect.dto.request.LoginRequest;
import com.farmconnect.dto.request.RegisterRequest;
import com.farmconnect.dto.request.SelectRoleRequest;
import com.farmconnect.dto.response.AuthResponse;
import com.farmconnect.dto.response.UserSummaryResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserSummaryResponse getCurrentUser(java.util.UUID userId);

    AuthResponse selectRole(String onboardingToken, SelectRoleRequest request);
}
