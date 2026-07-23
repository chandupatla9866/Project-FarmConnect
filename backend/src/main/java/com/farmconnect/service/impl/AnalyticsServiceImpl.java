package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.domain.entity.Order;
import com.farmconnect.domain.entity.OrderItem;
import com.farmconnect.domain.enums.OrderStatus;
import com.farmconnect.domain.enums.ProductStatus;
import com.farmconnect.dto.response.AnalyticsSummaryResponse;
import com.farmconnect.dto.response.RevenueTrendPoint;
import com.farmconnect.dto.response.TopProductResponse;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.FarmerRepository;
import com.farmconnect.repository.OrderItemRepository;
import com.farmconnect.repository.OrderRepository;
import com.farmconnect.repository.ProductRepository;
import com.farmconnect.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final FarmerRepository farmerRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse summary(UUID userId) {
        Farmer farmer = resolveFarmer(userId);

        List<OrderItem> deliveredItems = orderItemRepository.findDeliveredItemsByFarmerId(farmer.getId());
        long deliveredOrderCount = deliveredItems.stream().map(i -> i.getOrder().getId()).distinct().count();
        BigDecimal totalRevenue = deliveredItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgOrderValue = deliveredOrderCount == 0
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(deliveredOrderCount), 2, java.math.RoundingMode.HALF_UP);

        long pendingOrders = orderRepository.countByFarmerIdAndStatus(farmer.getId(), OrderStatus.PENDING);
        long activeProducts = productRepository.countByFarmerIdAndStatus(farmer.getId(), ProductStatus.ACTIVE);

        return new AnalyticsSummaryResponse(totalRevenue, deliveredOrderCount, avgOrderValue, pendingOrders, activeProducts);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueTrendPoint> revenueTrend(UUID userId, String range) {
        Farmer farmer = resolveFarmer(userId);
        boolean weekly = !"monthly".equalsIgnoreCase(range);

        Instant cutoff = weekly
                ? Instant.now().minus(6, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS)
                : Instant.now().minus(150, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);

        List<Order> orders = orderRepository.findByFarmerIdAndCreatedAtAfter(farmer.getId(), cutoff).stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .toList();

        return weekly ? bucketByDay(orders) : bucketByMonth(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductResponse> topProducts(UUID userId, int limit) {
        Farmer farmer = resolveFarmer(userId);
        List<OrderItem> deliveredItems = orderItemRepository.findDeliveredItemsByFarmerId(farmer.getId());

        Map<UUID, TopProductAccumulator> byProduct = new LinkedHashMap<>();
        for (OrderItem item : deliveredItems) {
            UUID productId = item.getProduct().getId();
            TopProductAccumulator acc = byProduct.computeIfAbsent(productId,
                    id -> new TopProductAccumulator(item.getProduct().getName()));
            acc.quantity = acc.quantity.add(item.getQuantity());
            acc.revenue = acc.revenue.add(item.getSubtotal());
        }

        return byProduct.entrySet().stream()
                .map(e -> new TopProductResponse(e.getKey(), e.getValue().name, e.getValue().quantity, e.getValue().revenue))
                .sorted(Comparator.comparing(TopProductResponse::totalRevenue).reversed())
                .limit(limit)
                .toList();
    }

    private List<RevenueTrendPoint> bucketByDay(List<Order> orders) {
        DateTimeFormatter dayLabel = DateTimeFormatter.ofPattern("EEE");
        Map<String, RevenueBucket> buckets = new LinkedHashMap<>();

        for (int i = 6; i >= 0; i--) {
            String label = Instant.now().minus(i, ChronoUnit.DAYS).atZone(ZoneOffset.UTC).format(dayLabel);
            buckets.put(label, new RevenueBucket());
        }

        for (Order order : orders) {
            String label = order.getCreatedAt().atZone(ZoneOffset.UTC).format(dayLabel);
            RevenueBucket bucket = buckets.get(label);
            if (bucket != null) {
                bucket.revenue = bucket.revenue.add(order.getTotalAmount());
                bucket.orders++;
            }
        }

        return buckets.entrySet().stream()
                .map(e -> new RevenueTrendPoint(e.getKey(), e.getValue().revenue, e.getValue().orders))
                .toList();
    }

    private List<RevenueTrendPoint> bucketByMonth(List<Order> orders) {
        Map<String, RevenueBucket> buckets = new LinkedHashMap<>();

        for (int i = 4; i >= 0; i--) {
            Instant monthInstant = Instant.now().minus(i * 30L, ChronoUnit.DAYS);
            String label = monthInstant.atZone(ZoneOffset.UTC).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            buckets.put(label, new RevenueBucket());
        }

        for (Order order : orders) {
            String label = order.getCreatedAt().atZone(ZoneOffset.UTC).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            RevenueBucket bucket = buckets.get(label);
            if (bucket != null) {
                bucket.revenue = bucket.revenue.add(order.getTotalAmount());
                bucket.orders++;
            }
        }

        return buckets.entrySet().stream()
                .map(e -> new RevenueTrendPoint(e.getKey(), e.getValue().revenue, e.getValue().orders))
                .toList();
    }

    private Farmer resolveFarmer(UUID userId) {
        return farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for current user"));
    }

    private static class RevenueBucket {
        BigDecimal revenue = BigDecimal.ZERO;
        long orders = 0;
    }

    private static class TopProductAccumulator {
        final String name;
        BigDecimal quantity = BigDecimal.ZERO;
        BigDecimal revenue = BigDecimal.ZERO;

        TopProductAccumulator(String name) {
            this.name = name;
        }
    }
}
