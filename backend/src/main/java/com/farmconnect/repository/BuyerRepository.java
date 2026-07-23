package com.farmconnect.repository;

import com.farmconnect.domain.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface BuyerRepository extends JpaRepository<Buyer, UUID>, JpaSpecificationExecutor<Buyer> {
    Optional<Buyer> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}
