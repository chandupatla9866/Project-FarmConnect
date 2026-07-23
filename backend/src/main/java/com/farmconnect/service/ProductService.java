package com.farmconnect.service;

import com.farmconnect.dto.request.ProductRequest;
import com.farmconnect.dto.request.ProductStatusUpdateRequest;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ProductService {

    PageResponse<ProductResponse> list(UUID userId, String status, UUID categoryId, Pageable pageable);

    ProductResponse get(UUID userId, UUID productId);

    ProductResponse create(UUID userId, ProductRequest request, MultipartFile image);

    ProductResponse update(UUID userId, UUID productId, ProductRequest request, MultipartFile image);

    void delete(UUID userId, UUID productId);

    ProductResponse updateStatus(UUID userId, UUID productId, ProductStatusUpdateRequest request);
}
