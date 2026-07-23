package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.Delivery;
import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.domain.entity.Order;
import com.farmconnect.domain.entity.OrderItem;
import com.farmconnect.domain.enums.NotificationType;
import com.farmconnect.domain.enums.OrderStatus;
import com.farmconnect.dto.response.OrderDetailResponse;
import com.farmconnect.dto.response.OrderItemResponse;
import com.farmconnect.dto.response.OrderSummaryResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.exception.InvalidOrderStateException;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.DeliveryRepository;
import com.farmconnect.repository.FarmerRepository;
import com.farmconnect.repository.OrderRepository;
import com.farmconnect.service.NotificationService;
import com.farmconnect.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final List<OrderStatus> HISTORY_STATUSES =
            List.of(OrderStatus.DELIVERED, OrderStatus.REJECTED, OrderStatus.CANCELLED);

    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrderRepository orderRepository;
    private final FarmerRepository farmerRepository;
    private final DeliveryRepository deliveryRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> list(UUID userId, String status, Pageable pageable) {
        Farmer farmer = resolveFarmer(userId);
        Page<Order> orders = StringUtils.hasText(status)
                ? orderRepository.findByFarmerIdAndStatus(farmer.getId(), OrderStatus.valueOf(status.toUpperCase()), pageable)
                : orderRepository.findByFarmerId(farmer.getId(), pageable);
        return PageResponse.of(orders.map(this::toSummary));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> history(UUID userId, Pageable pageable) {
        Farmer farmer = resolveFarmer(userId);
        return PageResponse.of(orderRepository
                .findByFarmerIdAndStatusIn(farmer.getId(), HISTORY_STATUSES, pageable)
                .map(this::toSummary));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse get(UUID userId, UUID orderId) {
        Farmer farmer = resolveFarmer(userId);
        return toDetail(findOwnedOrder(farmer, orderId));
    }

    @Override
    @Transactional
    public OrderDetailResponse accept(UUID userId, UUID orderId) {
        return transition(userId, orderId, OrderStatus.PENDING, OrderStatus.ACCEPTED, "Order accepted",
                (farmer, order) -> farmer.getFarmName() + " accepted your order " + order.getOrderNumber() + ".");
    }

    @Override
    @Transactional
    public OrderDetailResponse reject(UUID userId, UUID orderId) {
        return transition(userId, orderId, OrderStatus.PENDING, OrderStatus.REJECTED, "Order rejected",
                (farmer, order) -> farmer.getFarmName() + " was unable to fulfil your order " + order.getOrderNumber() + ".");
    }

    @Override
    @Transactional
    public OrderDetailResponse markReadyForPickup(UUID userId, UUID orderId) {
        Farmer farmer = resolveFarmer(userId);
        Order order = findOwnedOrder(farmer, orderId);

        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new InvalidOrderStateException(
                    "Cannot move order from " + order.getStatus() + " to READY_FOR_PICKUP (expected current state ACCEPTED)");
        }

        order.setStatus(OrderStatus.READY_FOR_PICKUP);
        order = orderRepository.save(order);

        String otp = String.format("%04d", RANDOM.nextInt(10000));
        BigDecimal distanceKm = haversineKm(
                farmer.getFarmLatitude(), farmer.getFarmLongitude(), order.getDeliveryLatitude(), order.getDeliveryLongitude());
        BigDecimal fee = distanceKm != null
                ? BigDecimal.valueOf(30).add(distanceKm.multiply(BigDecimal.valueOf(5))).setScale(2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.valueOf(50);

        Delivery delivery = Delivery.builder()
                .order(order)
                .pickupAddress(farmer.getFarmAddress() != null ? farmer.getFarmAddress() : farmer.getFarmCity())
                .dropAddress(order.getDeliveryAddress())
                .estimatedDistanceKm(distanceKm)
                .otp(otp)
                .deliveryFee(fee)
                .build();
        deliveryRepository.save(delivery);

        notificationService.notify(order.getBuyer().getUser(), "Order ready for pickup",
                "Your order " + order.getOrderNumber() + " from " + farmer.getFarmName()
                        + " is ready and awaiting a delivery partner. Your delivery OTP is " + otp + " - share it with the delivery partner upon drop-off.",
                NotificationType.ORDER_UPDATE, "ORDER", order.getId());

        return toDetail(order);
    }

    private BigDecimal haversineKm(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return null;
        }
        double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1.doubleValue())) * Math.cos(Math.toRadians(lat2.doubleValue()))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return BigDecimal.valueOf(earthRadiusKm * c).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private OrderDetailResponse transition(UUID userId, UUID orderId, OrderStatus expected, OrderStatus next,
                                            String notificationTitle, java.util.function.BiFunction<Farmer, Order, String> messageBuilder) {
        Farmer farmer = resolveFarmer(userId);
        Order order = findOwnedOrder(farmer, orderId);

        if (order.getStatus() != expected) {
            throw new InvalidOrderStateException(
                    "Cannot move order from " + order.getStatus() + " to " + next + " (expected current state " + expected + ")");
        }

        order.setStatus(next);
        order = orderRepository.save(order);

        notificationService.notify(order.getBuyer().getUser(), notificationTitle, messageBuilder.apply(farmer, order),
                NotificationType.ORDER_UPDATE, "ORDER", order.getId());

        return toDetail(order);
    }

    private Farmer resolveFarmer(UUID userId) {
        return farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for current user"));
    }

    private Order findOwnedOrder(Farmer farmer, UUID orderId) {
        return orderRepository.findByIdAndFarmerId(orderId, farmer.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Order", orderId));
    }

    private OrderSummaryResponse toSummary(Order order) {
        return new OrderSummaryResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getBuyer().getBusinessName(),
                order.getBuyer().getBuyerType().name(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getDeliveryAddress(),
                order.getExpectedDeliveryDate(),
                order.getItems().size(),
                order.getCreatedAt()
        );
    }

    private OrderDetailResponse toDetail(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        return new OrderDetailResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getBuyer().getBusinessName(),
                order.getBuyer().getBuyerType().name(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getDeliveryAddress(),
                order.getExpectedDeliveryDate(),
                order.getNotes(),
                items,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getUnit().name(),
                item.getQuantity(),
                item.getPricePerUnitAtOrder(),
                item.getSubtotal()
        );
    }
}
