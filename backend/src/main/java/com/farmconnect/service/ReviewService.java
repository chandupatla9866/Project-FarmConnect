package com.farmconnect.service;

import com.farmconnect.dto.request.ReviewCreateRequest;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ReviewService {

    ReviewResponse create(UUID buyerUserId, ReviewCreateRequest request);

    PageResponse<ReviewResponse> listForFarmer(UUID farmerUserId, Pageable pageable);
}
