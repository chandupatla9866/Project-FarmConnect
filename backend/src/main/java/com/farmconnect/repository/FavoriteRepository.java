package com.farmconnect.repository;

import com.farmconnect.domain.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {
    Page<Favorite> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId, Pageable pageable);

    Optional<Favorite> findByBuyerIdAndProductId(UUID buyerId, UUID productId);

    boolean existsByBuyerIdAndProductId(UUID buyerId, UUID productId);

    void deleteByBuyerIdAndProductId(UUID buyerId, UUID productId);
}
