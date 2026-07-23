package com.farmconnect.repository;

import com.farmconnect.domain.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderId(UUID orderId);

    @Query("""
            select oi from OrderItem oi
            where oi.order.farmer.id = :farmerId and oi.order.status = com.farmconnect.domain.enums.OrderStatus.DELIVERED
            """)
    List<OrderItem> findDeliveredItemsByFarmerId(UUID farmerId);
}
