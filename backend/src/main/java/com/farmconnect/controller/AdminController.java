package com.farmconnect.controller;

import com.farmconnect.dto.response.*;
import com.farmconnect.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/farmers")
    public ResponseEntity<ApiResponse<PageResponse<AdminFarmerResponse>>> listFarmers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean verifiedOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(adminService.listFarmers(search, verifiedOnly, pageable)));
    }

    @GetMapping("/farmers/{id}")
    public ResponseEntity<ApiResponse<AdminFarmerDetailResponse>> getFarmerDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getFarmerDetail(id)));
    }

    @PatchMapping("/farmers/{id}/verify")
    public ResponseEntity<ApiResponse<AdminFarmerResponse>> setFarmerVerified(
            @PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setFarmerVerified(id, Boolean.TRUE.equals(body.get("verified")))));
    }

    @PatchMapping("/farmers/{id}/enabled")
    public ResponseEntity<ApiResponse<AdminFarmerResponse>> setFarmerEnabled(
            @PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setFarmerEnabled(id, Boolean.TRUE.equals(body.get("enabled")))));
    }

    @GetMapping("/delivery-partners")
    public ResponseEntity<ApiResponse<PageResponse<AdminDeliveryPartnerResponse>>> listDeliveryPartners(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean approvedOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(adminService.listDeliveryPartners(search, approvedOnly, pageable)));
    }

    @PatchMapping("/delivery-partners/{id}/approve")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerResponse>> setDeliveryPartnerApproved(
            @PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setDeliveryPartnerApproved(id, Boolean.TRUE.equals(body.get("approved")))));
    }

    @PatchMapping("/delivery-partners/{id}/enabled")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerResponse>> setDeliveryPartnerEnabled(
            @PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setDeliveryPartnerEnabled(id, Boolean.TRUE.equals(body.get("enabled")))));
    }

    @GetMapping("/buyers")
    public ResponseEntity<ApiResponse<PageResponse<AdminBuyerResponse>>> listBuyers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(adminService.listBuyers(search, pageable)));
    }

    @PatchMapping("/buyers/{id}/enabled")
    public ResponseEntity<ApiResponse<AdminBuyerResponse>> setBuyerEnabled(
            @PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setBuyerEnabled(id, Boolean.TRUE.equals(body.get("enabled")))));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<AdminProductResponse>>> listProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(adminService.listProducts(search, status, pageable)));
    }

    @PatchMapping("/products/{id}/status")
    public ResponseEntity<ApiResponse<AdminProductResponse>> setProductStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setProductStatus(id, body.get("status"))));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<AdminOrderResponse>>> listOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(adminService.listOrders(status, pageable)));
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<PageResponse<AdminDeliveryResponse>>> listDeliveries(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(adminService.listDeliveries(status, pageable)));
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<ApiResponse<PlatformAnalyticsResponse>> analyticsSummary() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.analyticsSummary()));
    }

    @GetMapping("/analytics/revenue-trend")
    public ResponseEntity<ApiResponse<List<RevenueTrendPoint>>> revenueTrend(
            @RequestParam(defaultValue = "weekly") String range) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.revenueTrend(range)));
    }

    @GetMapping("/analytics/top-farmers")
    public ResponseEntity<ApiResponse<List<TopFarmerResponse>>> topFarmers(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.topFarmers(limit)));
    }
}
