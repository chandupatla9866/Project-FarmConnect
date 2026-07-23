package com.farmconnect.controller;

import com.farmconnect.dto.request.ReviewCreateRequest;
import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.dto.response.ReviewResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/buyer/reviews")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @AuthenticationPrincipal JwtPrincipal principal, @Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.create(principal.userId(), request)));
    }

    @GetMapping("/api/farmer/reviews")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> listForFarmer(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(reviewService.listForFarmer(principal.userId(), pageable)));
    }
}
