package com.farmconnect.controller;

import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.BuyerProductResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/buyer/favorites")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BUYER')")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BuyerProductResponse>>> list(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(favoriteService.list(principal.userId(), pageable)));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> add(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID productId) {
        favoriteService.add(principal.userId(), productId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID productId) {
        favoriteService.remove(principal.userId(), productId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
