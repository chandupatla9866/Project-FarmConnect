package com.farmconnect.controller;

import com.farmconnect.dto.request.FarmerProfileUpdateRequest;
import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.FarmerProfileResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.FarmerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmers/me")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerProfileController {

    private final FarmerService farmerService;

    @GetMapping
    public ResponseEntity<ApiResponse<FarmerProfileResponse>> getProfile(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(farmerService.getProfile(principal.userId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<FarmerProfileResponse>> updateProfile(
            @AuthenticationPrincipal JwtPrincipal principal,
            @Valid @RequestBody FarmerProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(farmerService.updateProfile(principal.userId(), request)));
    }
}
