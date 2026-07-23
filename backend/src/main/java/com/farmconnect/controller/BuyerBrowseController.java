package com.farmconnect.controller;

import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.BuyerProductResponse;
import com.farmconnect.dto.response.FarmerSummaryResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.BuyerBrowseService;
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
@RequestMapping("/api/buyer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BUYER')")
public class BuyerBrowseController {

    private final BuyerBrowseService buyerBrowseService;

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<BuyerProductResponse>>> browseProducts(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID farmerId,
            @RequestParam(required = false) Boolean organic,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(
                buyerBrowseService.browseProducts(principal.userId(), search, categoryId, farmerId, organic, pageable)));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<BuyerProductResponse>> getProduct(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(buyerBrowseService.getProduct(principal.userId(), id)));
    }

    @GetMapping("/farmers")
    public ResponseEntity<ApiResponse<PageResponse<FarmerSummaryResponse>>> browseFarmers(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean nearby,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(
                buyerBrowseService.browseFarmers(principal.userId(), search, nearby, pageable)));
    }

    @GetMapping("/farmers/{id}")
    public ResponseEntity<ApiResponse<FarmerSummaryResponse>> getFarmer(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(buyerBrowseService.getFarmer(principal.userId(), id)));
    }
}
