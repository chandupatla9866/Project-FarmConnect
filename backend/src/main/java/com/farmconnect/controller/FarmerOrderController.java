package com.farmconnect.controller;

import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.OrderDetailResponse;
import com.farmconnect.dto.response.OrderSummaryResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/farmer/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderSummaryResponse>>> list(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(orderService.list(principal.userId(), status, pageable)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PageResponse<OrderSummaryResponse>>> history(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(orderService.history(principal.userId(), pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> get(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.get(principal.userId(), id)));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> accept(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.accept(principal.userId(), id)));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> reject(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.reject(principal.userId(), id)));
    }

    @PatchMapping("/{id}/ready-for-pickup")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> readyForPickup(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.markReadyForPickup(principal.userId(), id)));
    }
}
