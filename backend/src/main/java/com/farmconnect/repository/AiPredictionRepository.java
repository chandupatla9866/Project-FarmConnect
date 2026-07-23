package com.farmconnect.repository;

import com.farmconnect.domain.entity.AiPrediction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiPredictionRepository extends JpaRepository<AiPrediction, UUID> {
    Page<AiPrediction> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId, Pageable pageable);
}
