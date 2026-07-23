package com.farmconnect.controller;

import com.farmconnect.dto.request.OrderCreateRequest;
import com.farmconnect.dto.request.VerifyPaymentRequest;
import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.BuyerOrderDetailResponse;
import com.farmconnect.dto.response.BuyerOrderSummaryResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.BuyerOrderService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/buyer/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BUYER')")
public class BuyerOrderController {

    private final BuyerOrderService buyerOrderService;

    @PostMapping
    public ResponseEntity<ApiResponse<BuyerOrderDetailResponse>> create(
            @AuthenticationPrincipal JwtPrincipal principal, @Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(buyerOrderService.createOrder(principal.userId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BuyerOrderSummaryResponse>>> list(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(buyerOrderService.list(principal.userId(), status, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BuyerOrderDetailResponse>> get(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(buyerOrderService.get(principal.userId(), id)));
    }

    @PostMapping("/{id}/verify-payment")
    public ResponseEntity<ApiResponse<BuyerOrderDetailResponse>> verifyPayment(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id,
            @Valid @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(buyerOrderService.verifyPayment(principal.userId(), id, request)));
    }
}
