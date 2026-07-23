package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.*;
import com.farmconnect.domain.enums.NotificationType;
import com.farmconnect.domain.enums.OrderStatus;
import com.farmconnect.domain.enums.PaymentMethod;
import com.farmconnect.domain.enums.PaymentStatus;
import com.farmconnect.domain.enums.ProductStatus;
import com.farmconnect.dto.request.OrderCreateRequest;
import com.farmconnect.dto.request.OrderItemCreateRequest;
import com.farmconnect.dto.request.VerifyPaymentRequest;
import com.farmconnect.dto.response.BuyerOrderDetailResponse;
import com.farmconnect.dto.response.BuyerOrderSummaryResponse;
import com.farmconnect.dto.response.OrderItemResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.exception.BadRequestException;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.payment.RazorpayPaymentService;
import com.farmconnect.repository.*;
import com.farmconnect.service.BuyerOrderService;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BuyerOrderServiceImpl implements BuyerOrderService {

    private static final java.util.Set<OrderStatus> OTP_VISIBLE_STATUSES =
            java.util.Set.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY);

    private final BuyerRepository buyerRepository;
    private final FarmerRepository farmerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final DeliveryRepository deliveryRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final RazorpayPaymentService razorpayPaymentService;

    @Override
    @Transactional
    public BuyerOrderDetailResponse createOrder(UUID userId, OrderCreateRequest request) {
        Buyer buyer = resolveBuyer(userId);
        Farmer farmer = farmerRepository.findById(request.farmerId())
                .orElseThrow(() -> ResourceNotFoundException.of("Farmer", request.farmerId()));
        if (!farmer.isVerified()) {
            throw new BadRequestException("This farmer is not yet verified and cannot accept orders.");
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .buyer(buyer)
                .farmer(farmer)
                .status(OrderStatus.PENDING)
                .deliveryAddress(StringUtils.hasText(request.deliveryAddress()) ? request.deliveryAddress() : buyer.getDeliveryAddress())
                .deliveryLatitude(buyer.getLatitude())
                .deliveryLongitude(buyer.getLongitude())
                .expectedDeliveryDate(request.expectedDeliveryDate())
                .notes(request.notes())
                .build();

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemCreateRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Product", itemRequest.productId()));

            if (!product.getFarmer().getId().equals(farmer.getId())) {
                throw new BadRequestException("All items in one order must belong to the same farmer: " + product.getName());
            }
            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new BadRequestException(product.getName() + " is not currently available");
            }
            if (product.getQuantityAvailable().compareTo(itemRequest.quantity()) < 0) {
                throw new BadRequestException("Not enough stock for " + product.getName()
                        + " (available: " + product.getQuantityAvailable() + " " + product.getUnit() + ")");
            }

            BigDecimal subtotal = product.getPricePerUnit().multiply(itemRequest.quantity());
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .pricePerUnitAtOrder(product.getPricePerUnit())
                    .subtotal(subtotal)
                    .build();
            items.add(item);
            total = total.add(subtotal);

            product.setQuantityAvailable(product.getQuantityAvailable().subtract(itemRequest.quantity()));
            if (product.getQuantityAvailable().compareTo(BigDecimal.ZERO) == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
            productRepository.save(product);
        }

        order.setItems(items);
        order.setTotalAmount(total);
        order = orderRepository.save(order);

        String paymentMethod = StringUtils.hasText(request.paymentMethod())
                ? request.paymentMethod().toUpperCase() : "COD";
        if ("RAZORPAY".equals(paymentMethod)) {
            if (!razorpayPaymentService.isConfigured()) {
                throw new BadRequestException("Online payment isn't set up yet - please choose Cash on Delivery.");
            }
            var razorpayOrder = razorpayPaymentService.createOrder(order.getOrderNumber(), total)
                    .orElseThrow(() -> new BadRequestException(
                            "Could not start online payment right now. Please try Cash on Delivery instead."));
            paymentRepository.save(Payment.builder()
                    .order(order)
                    .amount(total)
                    .paymentMethod(PaymentMethod.RAZORPAY)
                    .paymentStatus(PaymentStatus.PENDING)
                    .transactionRef(razorpayOrder.id())
                    .build());
        }

        notificationService.notify(farmer.getUser(), "New order received",
                buyer.getBusinessName() + " placed a new order (" + order.getOrderNumber() + ") worth ₹" + total + ".",
                NotificationType.ORDER_UPDATE, "ORDER", order.getId());

        return toDetail(order, Set.of());
    }

    @Override
    @Transactional
    public BuyerOrderDetailResponse verifyPayment(UUID userId, UUID orderId, VerifyPaymentRequest request) {
        Buyer buyer = resolveBuyer(userId);
        Order order = orderRepository.findByIdAndBuyerId(orderId, buyer.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Order", orderId));
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new BadRequestException("No pending online payment found for this order"));

        if (!request.razorpayOrderId().equals(payment.getTransactionRef())) {
            throw new BadRequestException("This payment does not match the order's payment record");
        }

        boolean verified = razorpayPaymentService.verifySignature(
                request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature());
        if (!verified) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            log.warn("Razorpay signature verification failed for order {}", order.getOrderNumber());
            throw new BadRequestException("Payment verification failed. Please try again or choose Cash on Delivery.");
        }

        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setTransactionRef(request.razorpayPaymentId());
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);

        notificationService.notify(order.getFarmer().getUser(), "Payment received",
                "Online payment of ₹" + order.getTotalAmount() + " received for order " + order.getOrderNumber() + ".",
                NotificationType.PAYMENT, "ORDER", order.getId());

        boolean reviewed = reviewRepository.existsByOrderId(order.getId());
        return toDetail(order, reviewed ? Set.of(order.getId()) : Set.of());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BuyerOrderSummaryResponse> list(UUID userId, String status, Pageable pageable) {
        Buyer buyer = resolveBuyer(userId);
        Page<Order> orders = StringUtils.hasText(status)
                ? orderRepository.findByBuyerIdAndStatus(buyer.getId(), OrderStatus.valueOf(status.toUpperCase()), pageable)
                : orderRepository.findByBuyerId(buyer.getId(), pageable);
        return PageResponse.of(orders.map(this::toSummary));
    }

    @Override
    @Transactional(readOnly = true)
    public BuyerOrderDetailResponse get(UUID userId, UUID orderId) {
        Buyer buyer = resolveBuyer(userId);
        Order order = orderRepository.findByIdAndBuyerId(orderId, buyer.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Order", orderId));
        boolean reviewed = reviewRepository.existsByOrderId(order.getId());
        return toDetail(order, reviewed ? Set.of(order.getId()) : Set.of());
    }

    private Buyer resolveBuyer(UUID userId) {
        return buyerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found for current user"));
    }

    private String generateOrderNumber() {
        long sequence = orderRepository.count() + 1;
        return String.format("FC-ORD-%06d", sequence);
    }

    private BuyerOrderSummaryResponse toSummary(Order order) {
        return new BuyerOrderSummaryResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getFarmer().getId(),
                order.getFarmer().getFarmName(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getDeliveryAddress(),
                order.getExpectedDeliveryDate(),
                order.getItems().size(),
                order.getCreatedAt()
        );
    }

    private BuyerOrderDetailResponse toDetail(Order order, Set<UUID> reviewedOrderIds) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getUnit().name(),
                        item.getQuantity(),
                        item.getPricePerUnitAtOrder(),
                        item.getSubtotal()))
                .toList();

        String deliveryOtp = null;
        if (OTP_VISIBLE_STATUSES.contains(order.getStatus())) {
            deliveryOtp = deliveryRepository.findByOrderId(order.getId()).map(Delivery::getOtp).orElse(null);
        }

        Optional<Payment> payment = paymentRepository.findByOrderId(order.getId());
        String paymentMethod = payment.map(p -> p.getPaymentMethod().name()).orElse(PaymentMethod.COD.name());
        String paymentStatus = payment.map(p -> p.getPaymentStatus().name()).orElse(PaymentStatus.PENDING.name());
        boolean awaitingOnlinePayment = payment.isPresent()
                && payment.get().getPaymentMethod() == PaymentMethod.RAZORPAY
                && payment.get().getPaymentStatus() == PaymentStatus.PENDING;
        String razorpayOrderId = awaitingOnlinePayment ? payment.get().getTransactionRef() : null;
        String razorpayKeyId = awaitingOnlinePayment ? razorpayPaymentService.getPublicKeyId() : null;

        return new BuyerOrderDetailResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getFarmer().getId(),
                order.getFarmer().getFarmName(),
                order.getFarmer().getFarmCity(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getDeliveryAddress(),
                order.getExpectedDeliveryDate(),
                order.getNotes(),
                items,
                reviewedOrderIds.contains(order.getId()),
                deliveryOtp,
                paymentMethod,
                paymentStatus,
                razorpayOrderId,
                razorpayKeyId,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
