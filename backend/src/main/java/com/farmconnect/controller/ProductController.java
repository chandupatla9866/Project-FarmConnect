package com.farmconnect.controller;

import com.farmconnect.dto.request.ProductRequest;
import com.farmconnect.dto.request.ProductStatusUpdateRequest;
import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.dto.response.ProductResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/farmer/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> list(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(productService.list(principal.userId(), status, categoryId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> get(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.get(principal.userId(), id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @AuthenticationPrincipal JwtPrincipal principal,
            @Valid @ModelAttribute ProductRequest request,
            @RequestParam(required = false) MultipartFile image) {
        return ResponseEntity.ok(ApiResponse.ok(productService.create(principal.userId(), request, image)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @AuthenticationPrincipal JwtPrincipal principal,
            @PathVariable UUID id,
            @Valid @ModelAttribute ProductRequest request,
            @RequestParam(required = false) MultipartFile image) {
        return ResponseEntity.ok(ApiResponse.ok(productService.update(principal.userId(), id, request, image)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        productService.delete(principal.userId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStatus(
            @AuthenticationPrincipal JwtPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody ProductStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productService.updateStatus(principal.userId(), id, request)));
    }
}
