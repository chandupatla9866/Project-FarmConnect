package com.farmconnect.controller;

import com.farmconnect.dto.request.BuyerProfileUpdateRequest;
import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.BuyerProfileResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.BuyerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/buyers/me")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BUYER')")
public class BuyerProfileController {

    private final BuyerService buyerService;

    @GetMapping
    public ResponseEntity<ApiResponse<BuyerProfileResponse>> getProfile(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(buyerService.getProfile(principal.userId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<BuyerProfileResponse>> updateProfile(
            @AuthenticationPrincipal JwtPrincipal principal,
            @Valid @RequestBody BuyerProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(buyerService.updateProfile(principal.userId(), request)));
    }
}
