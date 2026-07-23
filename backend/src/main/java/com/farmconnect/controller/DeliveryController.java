package com.farmconnect.controller;

import com.farmconnect.dto.request.OtpVerifyRequest;
import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.DeliveryEarningsResponse;
import com.farmconnect.dto.response.DeliveryResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.DeliveryService;
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
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DELIVERY')")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<PageResponse<DeliveryResponse>>> listAvailable(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(deliveryService.listAvailable(pageable)));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<PageResponse<DeliveryResponse>>> listMine(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(deliveryService.listMine(principal.userId(), status, pageable)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PageResponse<DeliveryResponse>>> history(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "deliveryTime"));
        return ResponseEntity.ok(ApiResponse.ok(deliveryService.history(principal.userId(), pageable)));
    }

    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<DeliveryEarningsResponse>> earnings(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(deliveryService.earnings(principal.userId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryResponse>> get(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(deliveryService.get(principal.userId(), id)));
    }

    @PatchMapping("/{id}/claim")
    public ResponseEntity<ApiResponse<DeliveryResponse>> claim(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(deliveryService.claim(principal.userId(), id)));
    }

    @PatchMapping("/{id}/picked-up")
    public ResponseEntity<ApiResponse<DeliveryResponse>> markPickedUp(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(deliveryService.markPickedUp(principal.userId(), id)));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<DeliveryResponse>> complete(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id,
            @Valid @RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(deliveryService.completeDelivery(principal.userId(), id, request)));
    }
}
