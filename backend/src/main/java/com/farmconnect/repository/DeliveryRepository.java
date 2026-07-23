package com.farmconnect.repository;

import com.farmconnect.domain.entity.Delivery;
import com.farmconnect.domain.enums.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {
    Optional<Delivery> findByOrderId(UUID orderId);

    Optional<Delivery> findByIdAndDeliveryPartnerId(UUID id, UUID deliveryPartnerId);

    Page<Delivery> findByStatusAndDeliveryPartnerIsNull(DeliveryStatus status, Pageable pageable);

    Page<Delivery> findByDeliveryPartnerId(UUID deliveryPartnerId, Pageable pageable);

    Page<Delivery> findByDeliveryPartnerIdAndStatus(UUID deliveryPartnerId, DeliveryStatus status, Pageable pageable);

    Page<Delivery> findByDeliveryPartnerIdAndStatusIn(UUID deliveryPartnerId, java.util.List<DeliveryStatus> statuses, Pageable pageable);

    long countByDeliveryPartnerIdAndStatus(UUID deliveryPartnerId, DeliveryStatus status);

    Page<Delivery> findByStatus(DeliveryStatus status, Pageable pageable);
}
