package com.farmconnect.repository;

import com.farmconnect.domain.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByFarmerId(UUID farmerId, Pageable pageable);

    boolean existsByOrderId(UUID orderId);

    List<Review> findByOrderIdIn(List<UUID> orderIds);
}
