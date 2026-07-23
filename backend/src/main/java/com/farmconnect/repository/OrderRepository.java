package com.farmconnect.repository;

import com.farmconnect.domain.entity.Order;
import com.farmconnect.domain.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByIdAndFarmerId(UUID id, UUID farmerId);

    Optional<Order> findByIdAndBuyerId(UUID id, UUID buyerId);

    Page<Order> findByFarmerId(UUID farmerId, Pageable pageable);

    Page<Order> findByFarmerIdAndStatus(UUID farmerId, OrderStatus status, Pageable pageable);

    Page<Order> findByFarmerIdAndStatusIn(UUID farmerId, List<OrderStatus> statuses, Pageable pageable);

    Page<Order> findByBuyerId(UUID buyerId, Pageable pageable);

    Page<Order> findByBuyerIdAndStatus(UUID buyerId, OrderStatus status, Pageable pageable);

    long countByFarmerIdAndStatus(UUID farmerId, OrderStatus status);

    long countByBuyerId(UUID buyerId);

    List<Order> findByFarmerIdAndCreatedAtAfter(UUID farmerId, Instant after);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") OrderStatus status);
}
