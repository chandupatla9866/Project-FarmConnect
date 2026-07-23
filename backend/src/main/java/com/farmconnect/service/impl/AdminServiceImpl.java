package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.*;
import com.farmconnect.domain.enums.DeliveryStatus;
import com.farmconnect.domain.enums.OrderStatus;
import com.farmconnect.domain.enums.ProductStatus;
import com.farmconnect.domain.enums.RoleName;
import com.farmconnect.dto.response.*;
import com.farmconnect.exception.BadRequestException;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.*;
import com.farmconnect.service.AdminService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final FarmerRepository farmerRepository;
    private final BuyerRepository buyerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminFarmerResponse> listFarmers(String search, Boolean verifiedOnly, Pageable pageable) {
        Specification<Farmer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("farmName")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("farmCity")), "%" + search.toLowerCase() + "%")));
            }
            if (verifiedOnly != null) {
                predicates.add(cb.equal(root.get("verified"), verifiedOnly));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return PageResponse.of(farmerRepository.findAll(spec, pageable).map(this::toFarmerResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminFarmerDetailResponse getFarmerDetail(UUID farmerId) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> ResourceNotFoundException.of("Farmer", farmerId));
        List<AdminProductResponse> products = productRepository.findByFarmerId(farmerId).stream()
                .map(this::toProductResponse)
                .toList();
        return new AdminFarmerDetailResponse(
                farmer.getId(), farmer.getUser().getFullName(), farmer.getUser().getEmail(), farmer.getUser().getPhone(),
                farmer.getFarmName(), farmer.getFarmAddress(), farmer.getFarmCity(), farmer.getFarmState(), farmer.getFarmPincode(),
                farmer.getFarmSizeAcres(), farmer.getFarmingExperienceYears(), farmer.getPrimaryCropTypes(), farmer.getBio(),
                farmer.getFarmLatitude(), farmer.getFarmLongitude(), farmer.isVerified(), farmer.getUser().isEnabled(),
                farmer.getCreatedAt(), products);
    }

    @Override
    @Transactional
    public AdminFarmerResponse setFarmerVerified(UUID farmerId, boolean verified) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> ResourceNotFoundException.of("Farmer", farmerId));
        farmer.setVerified(verified);
        return toFarmerResponse(farmerRepository.save(farmer));
    }

    @Override
    @Transactional
    public AdminFarmerResponse setFarmerEnabled(UUID farmerId, boolean enabled) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> ResourceNotFoundException.of("Farmer", farmerId));
        farmer.getUser().setEnabled(enabled);
        return toFarmerResponse(farmer);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminBuyerResponse> listBuyers(String search, Pageable pageable) {
        Specification<Buyer> spec = (root, query, cb) -> {
            if (!StringUtils.hasText(search)) {
                return cb.conjunction();
            }
            String like = "%" + search.toLowerCase() + "%";
            return cb.or(cb.like(cb.lower(root.get("businessName")), like), cb.like(cb.lower(root.get("city")), like));
        };
        return PageResponse.of(buyerRepository.findAll(spec, pageable).map(this::toBuyerResponse));
    }

    @Override
    @Transactional
    public AdminBuyerResponse setBuyerEnabled(UUID buyerId, boolean enabled) {
        Buyer buyer = buyerRepository.findById(buyerId)
                .orElseThrow(() -> ResourceNotFoundException.of("Buyer", buyerId));
        buyer.getUser().setEnabled(enabled);
        return toBuyerResponse(buyer);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminDeliveryPartnerResponse> listDeliveryPartners(String search, Boolean approvedOnly, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.join("roles").get("name"), RoleName.ROLE_DELIVERY));
            if (StringUtils.hasText(search)) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(cb.like(cb.lower(root.get("fullName")), like), cb.like(cb.lower(root.get("email")), like)));
            }
            if (approvedOnly != null) {
                predicates.add(cb.equal(root.get("approved"), approvedOnly));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return PageResponse.of(userRepository.findAll(spec, pageable).map(this::toDeliveryPartnerResponse));
    }

    @Override
    @Transactional
    public AdminDeliveryPartnerResponse setDeliveryPartnerApproved(UUID userId, boolean approved) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        user.setApproved(approved);
        return toDeliveryPartnerResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public AdminDeliveryPartnerResponse setDeliveryPartnerEnabled(UUID userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        user.setEnabled(enabled);
        return toDeliveryPartnerResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminProductResponse> listProducts(String search, String status, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), ProductStatus.valueOf(status.toUpperCase())));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return PageResponse.of(productRepository.findAll(spec, pageable).map(this::toProductResponse));
    }

    @Override
    @Transactional
    public AdminProductResponse setProductStatus(UUID productId, String status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", productId));
        try {
            product.setStatus(ProductStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid product status: " + status);
        }
        return toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminOrderResponse> listOrders(String status, Pageable pageable) {
        Page<Order> orders = StringUtils.hasText(status)
                ? orderRepository.findByStatus(OrderStatus.valueOf(status.toUpperCase()), pageable)
                : orderRepository.findAll(pageable);
        return PageResponse.of(orders.map(this::toOrderResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminDeliveryResponse> listDeliveries(String status, Pageable pageable) {
        Page<Delivery> deliveries = StringUtils.hasText(status)
                ? deliveryRepository.findByStatus(DeliveryStatus.valueOf(status.toUpperCase()), pageable)
                : deliveryRepository.findAll(pageable);
        return PageResponse.of(deliveries.map(this::toDeliveryResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PlatformAnalyticsResponse analyticsSummary() {
        return new PlatformAnalyticsResponse(
                farmerRepository.count(),
                farmerRepository.countByVerified(true),
                buyerRepository.count(),
                productRepository.count(),
                productRepository.countByStatus(ProductStatus.ACTIVE),
                orderRepository.count(),
                orderRepository.countByStatus(OrderStatus.PENDING),
                orderRepository.countByStatus(OrderStatus.DELIVERED),
                orderRepository.sumTotalAmountByStatus(OrderStatus.DELIVERED)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueTrendPoint> revenueTrend(String range) {
        boolean weekly = !"monthly".equalsIgnoreCase(range);
        Instant cutoff = weekly
                ? Instant.now().minus(6, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS)
                : Instant.now().minus(150, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);

        List<Order> delivered = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED && o.getCreatedAt().isAfter(cutoff))
                .toList();

        return weekly ? bucketByDay(delivered) : bucketByMonth(delivered);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopFarmerResponse> topFarmers(int limit) {
        List<Order> delivered = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .toList();

        Map<UUID, TopFarmerAccumulator> byFarmer = new LinkedHashMap<>();
        for (Order order : delivered) {
            Farmer farmer = order.getFarmer();
            TopFarmerAccumulator acc = byFarmer.computeIfAbsent(farmer.getId(), id -> new TopFarmerAccumulator(farmer.getFarmName()));
            acc.revenue = acc.revenue.add(order.getTotalAmount());
            acc.orders++;
        }

        return byFarmer.entrySet().stream()
                .map(e -> new TopFarmerResponse(e.getKey(), e.getValue().name, e.getValue().revenue, e.getValue().orders))
                .sorted(Comparator.comparing(TopFarmerResponse::totalRevenue).reversed())
                .limit(limit)
                .toList();
    }

    private List<RevenueTrendPoint> bucketByDay(List<Order> orders) {
        DateTimeFormatter dayLabel = DateTimeFormatter.ofPattern("EEE");
        Map<String, RevenueBucket> buckets = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            buckets.put(Instant.now().minus(i, ChronoUnit.DAYS).atZone(ZoneOffset.UTC).format(dayLabel), new RevenueBucket());
        }
        for (Order order : orders) {
            RevenueBucket bucket = buckets.get(order.getCreatedAt().atZone(ZoneOffset.UTC).format(dayLabel));
            if (bucket != null) {
                bucket.revenue = bucket.revenue.add(order.getTotalAmount());
                bucket.orders++;
            }
        }
        return buckets.entrySet().stream().map(e -> new RevenueTrendPoint(e.getKey(), e.getValue().revenue, e.getValue().orders)).toList();
    }

    private List<RevenueTrendPoint> bucketByMonth(List<Order> orders) {
        Map<String, RevenueBucket> buckets = new LinkedHashMap<>();
        for (int i = 4; i >= 0; i--) {
            Instant monthInstant = Instant.now().minus(i * 30L, ChronoUnit.DAYS);
            buckets.put(monthInstant.atZone(ZoneOffset.UTC).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), new RevenueBucket());
        }
        for (Order order : orders) {
            String label = order.getCreatedAt().atZone(ZoneOffset.UTC).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            RevenueBucket bucket = buckets.get(label);
            if (bucket != null) {
                bucket.revenue = bucket.revenue.add(order.getTotalAmount());
                bucket.orders++;
            }
        }
        return buckets.entrySet().stream().map(e -> new RevenueTrendPoint(e.getKey(), e.getValue().revenue, e.getValue().orders)).toList();
    }

    private AdminFarmerResponse toFarmerResponse(Farmer farmer) {
        long productCount = productRepository.countByFarmerIdAndStatus(farmer.getId(), ProductStatus.ACTIVE);
        return new AdminFarmerResponse(
                farmer.getId(), farmer.getUser().getFullName(), farmer.getUser().getEmail(), farmer.getUser().getPhone(),
                farmer.getFarmName(), farmer.getFarmCity(), farmer.getFarmState(), farmer.isVerified(),
                farmer.getUser().isEnabled(), productCount, farmer.getCreatedAt());
    }

    private AdminDeliveryPartnerResponse toDeliveryPartnerResponse(User user) {
        long deliveriesCompleted = deliveryRepository.countByDeliveryPartnerIdAndStatus(user.getId(), DeliveryStatus.DELIVERED);
        return new AdminDeliveryPartnerResponse(
                user.getId(), user.getFullName(), user.getEmail(), user.getPhone(),
                user.isApproved(), user.isEnabled(), deliveriesCompleted, user.getCreatedAt());
    }

    private AdminBuyerResponse toBuyerResponse(Buyer buyer) {
        return new AdminBuyerResponse(
                buyer.getId(), buyer.getUser().getFullName(), buyer.getUser().getEmail(), buyer.getUser().getPhone(),
                buyer.getBuyerType().name(), buyer.getBusinessName(), buyer.getCity(), buyer.getUser().isEnabled(), buyer.getCreatedAt());
    }

    private AdminProductResponse toProductResponse(Product product) {
        return new AdminProductResponse(
                product.getId(), product.getName(), product.getCategory().getName(), product.getFarmer().getId(),
                product.getFarmer().getFarmName(), product.getImageUrl(), product.getPricePerUnit(), product.getQuantityAvailable(),
                product.isOrganic(), product.getStatus().name(), product.getCreatedAt());
    }

    private AdminOrderResponse toOrderResponse(Order order) {
        return new AdminOrderResponse(
                order.getId(), order.getOrderNumber(), order.getBuyer().getBusinessName(), order.getFarmer().getFarmName(),
                order.getStatus().name(), order.getTotalAmount(), order.getItems().size(), order.getCreatedAt());
    }

    private AdminDeliveryResponse toDeliveryResponse(Delivery delivery) {
        return new AdminDeliveryResponse(
                delivery.getId(), delivery.getOrder().getOrderNumber(), delivery.getOrder().getFarmer().getFarmName(),
                delivery.getOrder().getBuyer().getBusinessName(),
                delivery.getDeliveryPartner() != null ? delivery.getDeliveryPartner().getFullName() : null,
                delivery.getStatus().name(), delivery.getDeliveryFee(), delivery.getCreatedAt());
    }

    private static class RevenueBucket {
        BigDecimal revenue = BigDecimal.ZERO;
        long orders = 0;
    }

    private static class TopFarmerAccumulator {
        final String name;
        BigDecimal revenue = BigDecimal.ZERO;
        long orders = 0;

        TopFarmerAccumulator(String name) {
            this.name = name;
        }
    }
}
