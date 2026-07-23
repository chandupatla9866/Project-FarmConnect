package com.farmconnect.repository;

import com.farmconnect.domain.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface FarmerRepository extends JpaRepository<Farmer, UUID>, JpaSpecificationExecutor<Farmer> {
    Optional<Farmer> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    long countByVerified(boolean verified);
}
