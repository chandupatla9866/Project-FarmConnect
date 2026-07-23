package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.Delivery;
import com.farmconnect.domain.entity.Order;
import com.farmconnect.domain.entity.Payment;
import com.farmconnect.domain.entity.User;
import com.farmconnect.domain.enums.DeliveryStatus;
import com.farmconnect.domain.enums.NotificationType;
import com.farmconnect.domain.enums.OrderStatus;
import com.farmconnect.domain.enums.PaymentMethod;
import com.farmconnect.domain.enums.PaymentStatus;
import com.farmconnect.dto.request.OtpVerifyRequest;
import com.farmconnect.dto.response.DeliveryEarningsResponse;
import com.farmconnect.dto.response.DeliveryResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.exception.BadRequestException;
import com.farmconnect.exception.InvalidOrderStateException;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.DeliveryRepository;
import com.farmconnect.repository.OrderRepository;
import com.farmconnect.repository.PaymentRepository;
import com.farmconnect.repository.UserRepository;
import com.farmconnect.service.DeliveryService;
import com.farmconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DeliveryResponse> listAvailable(Pageable pageable) {
        return PageResponse.of(deliveryRepository
                .findByStatusAndDeliveryPartnerIsNull(DeliveryStatus.ASSIGNED, pageable)
                .map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DeliveryResponse> listMine(UUID userId, String status, Pageable pageable) {
        Page<Delivery> deliveries = StringUtils.hasText(status)
                ? deliveryRepository.findByDeliveryPartnerIdAndStatus(userId, DeliveryStatus.valueOf(status.toUpperCase()), pageable)
                : deliveryRepository.findByDeliveryPartnerIdAndStatusIn(
                        userId, List.of(DeliveryStatus.ASSIGNED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT), pageable);
        return PageResponse.of(deliveries.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DeliveryResponse> history(UUID userId, Pageable pageable) {
        return PageResponse.of(deliveryRepository
                .findByDeliveryPartnerIdAndStatusIn(userId, List.of(DeliveryStatus.DELIVERED, DeliveryStatus.FAILED), pageable)
                .map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryResponse get(UUID userId, UUID deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> ResourceNotFoundException.of("Delivery", deliveryId));

        boolean visible = delivery.getDeliveryPartner() == null || delivery.getDeliveryPartner().getId().equals(userId);
        if (!visible) {
            throw ResourceNotFoundException.of("Delivery", deliveryId);
        }
        return toResponse(delivery);
    }

    @Override
    @Transactional
    public DeliveryResponse claim(UUID userId, UUID deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> ResourceNotFoundException.of("Delivery", deliveryId));

        if (delivery.getDeliveryPartner() != null) {
            throw new BadRequestException("This pickup has already been claimed by another delivery partner");
        }

        User partner = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        if (!partner.isApproved()) {
            throw new BadRequestException("Your delivery partner account is still pending admin approval.");
        }
        delivery.setDeliveryPartner(partner);
        delivery = deliveryRepository.save(delivery);

        notificationService.notify(delivery.getOrder().getFarmer().getUser(), "Delivery partner assigned",
                "A delivery partner has been assigned to pick up order " + delivery.getOrder().getOrderNumber() + ".",
                NotificationType.ORDER_UPDATE, "ORDER", delivery.getOrder().getId());

        return toResponse(delivery);
    }

    @Override
    @Transactional
    public DeliveryResponse markPickedUp(UUID userId, UUID deliveryId) {
        Delivery delivery = findOwnedDelivery(userId, deliveryId);

        if (delivery.getStatus() != DeliveryStatus.ASSIGNED) {
            throw new InvalidOrderStateException("This delivery is not awaiting pickup");
        }

        delivery.setStatus(DeliveryStatus.PICKED_UP);
        delivery.setPickupTime(Instant.now());
        deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        orderRepository.save(order);

        notificationService.notify(order.getBuyer().getUser(), "Order picked up",
                "Your order " + order.getOrderNumber() + " has been picked up and is on its way.",
                NotificationType.ORDER_UPDATE, "ORDER", order.getId());

        return toResponse(delivery);
    }

    @Override
    @Transactional
    public DeliveryResponse completeDelivery(UUID userId, UUID deliveryId, OtpVerifyRequest request) {
        Delivery delivery = findOwnedDelivery(userId, deliveryId);

        if (delivery.getStatus() != DeliveryStatus.PICKED_UP && delivery.getStatus() != DeliveryStatus.IN_TRANSIT) {
            throw new InvalidOrderStateException("This delivery has not been picked up yet");
        }
        if (delivery.getOtp() == null || !delivery.getOtp().equals(request.otp().trim())) {
            throw new BadRequestException("Incorrect OTP. Please ask the buyer for the correct delivery OTP.");
        }

        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.setDeliveryTime(Instant.now());
        deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElseGet(() -> Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .paymentMethod(PaymentMethod.COD)
                .build());
        // Only COD is settled by delivery itself. An online (Razorpay) payment must already
        // be COMPLETED via verifyPayment() before drop-off - delivering the goods doesn't
        // retroactively mark an unpaid online order as paid.
        if (payment.getPaymentMethod() == PaymentMethod.COD) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(Instant.now());
            if (payment.getTransactionRef() == null) {
                payment.setTransactionRef("COD-" + order.getOrderNumber());
            }
            paymentRepository.save(payment);
        } else if (payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
            log.warn("Order {} delivered but its online payment is still {}", order.getOrderNumber(), payment.getPaymentStatus());
        }

        notificationService.notify(order.getBuyer().getUser(), "Order delivered",
                "Your order " + order.getOrderNumber() + " has been delivered. Enjoy your fresh produce!",
                NotificationType.ORDER_UPDATE, "ORDER", order.getId());
        notificationService.notify(order.getFarmer().getUser(), "Payment received",
                "Payment of ₹" + order.getTotalAmount() + " for order " + order.getOrderNumber() + " has been completed.",
                NotificationType.PAYMENT, "ORDER", order.getId());

        return toResponse(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryEarningsResponse earnings(UUID userId) {
        List<Delivery> delivered = deliveryRepository
                .findByDeliveryPartnerIdAndStatusIn(userId, List.of(DeliveryStatus.DELIVERED), Pageable.unpaged())
                .getContent();

        BigDecimal total = delivered.stream()
                .map(d -> d.getDeliveryFee() != null ? d.getDeliveryFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        List<Delivery> thisWeek = delivered.stream()
                .filter(d -> d.getDeliveryTime() != null && d.getDeliveryTime().isAfter(weekAgo))
                .toList();
        BigDecimal weekTotal = thisWeek.stream()
                .map(d -> d.getDeliveryFee() != null ? d.getDeliveryFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DeliveryEarningsResponse(total, delivered.size(), weekTotal, thisWeek.size());
    }

    private Delivery findOwnedDelivery(UUID userId, UUID deliveryId) {
        return deliveryRepository.findByIdAndDeliveryPartnerId(deliveryId, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Delivery", deliveryId));
    }

    private DeliveryResponse toResponse(Delivery delivery) {
        Order order = delivery.getOrder();
        return new DeliveryResponse(
                delivery.getId(),
                order.getId(),
                order.getOrderNumber(),
                order.getBuyer().getBusinessName(),
                order.getFarmer().getFarmName(),
                delivery.getPickupAddress(),
                delivery.getDropAddress(),
                delivery.getStatus().name(),
                delivery.getEstimatedDistanceKm(),
                delivery.getDeliveryFee(),
                delivery.getDeliveryPartner() != null,
                delivery.getPickupTime(),
                delivery.getDeliveryTime(),
                delivery.getCreatedAt()
        );
    }
}
