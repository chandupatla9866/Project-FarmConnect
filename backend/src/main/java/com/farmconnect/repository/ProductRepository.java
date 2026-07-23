package com.farmconnect.repository;

import com.farmconnect.domain.entity.Product;
import com.farmconnect.domain.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    Optional<Product> findByIdAndFarmerId(UUID id, UUID farmerId);

    List<Product> findByFarmerId(UUID farmerId);

    long countByFarmerIdAndStatus(UUID farmerId, ProductStatus status);

    long countByStatus(ProductStatus status);
}
