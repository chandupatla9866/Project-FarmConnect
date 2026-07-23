package com.farmconnect.service;

import com.farmconnect.dto.response.BuyerProductResponse;
import com.farmconnect.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface FavoriteService {

    PageResponse<BuyerProductResponse> list(UUID userId, Pageable pageable);

    void add(UUID userId, UUID productId);

    void remove(UUID userId, UUID productId);
}
