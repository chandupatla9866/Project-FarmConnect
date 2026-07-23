package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.Buyer;
import com.farmconnect.domain.entity.Category;
import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.domain.entity.Product;
import com.farmconnect.domain.enums.ProductStatus;
import com.farmconnect.dto.response.BuyerProductResponse;
import com.farmconnect.dto.response.CategoryResponse;
import com.farmconnect.dto.response.FarmerSummaryResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.BuyerRepository;
import com.farmconnect.repository.FarmerRepository;
import com.farmconnect.repository.FavoriteRepository;
import com.farmconnect.repository.ProductRepository;
import com.farmconnect.service.BuyerBrowseService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BuyerBrowseServiceImpl implements BuyerBrowseService {

    private final ProductRepository productRepository;
    private final FarmerRepository farmerRepository;
    private final BuyerRepository buyerRepository;
    private final FavoriteRepository favoriteRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BuyerProductResponse> browseProducts(
            UUID userId, String search, UUID categoryId, UUID farmerId, Boolean organic, Pageable pageable) {
        Buyer buyer = resolveBuyer(userId);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));
            predicates.add(cb.isTrue(root.get("farmer").get("verified")));
            if (StringUtils.hasText(search)) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (farmerId != null) {
                predicates.add(cb.equal(root.get("farmer").get("id"), farmerId));
            }
            if (organic != null) {
                predicates.add(cb.equal(root.get("organic"), organic));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return PageResponse.of(productRepository.findAll(spec, pageable)
                .map(product -> toResponse(product, buyer)));
    }

    @Override
    @Transactional(readOnly = true)
    public BuyerProductResponse getProduct(UUID userId, UUID productId) {
        Buyer buyer = resolveBuyer(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", productId));
        if (!product.getFarmer().isVerified()) {
            throw ResourceNotFoundException.of("Product", productId);
        }
        return toResponse(product, buyer);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FarmerSummaryResponse> browseFarmers(UUID userId, String search, boolean nearbyOnly, Pageable pageable) {
        Buyer buyer = resolveBuyer(userId);

        Specification<Farmer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("verified")));
            if (StringUtils.hasText(search)) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("farmName")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("farmCity")), "%" + search.toLowerCase() + "%")));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageResponse<FarmerSummaryResponse> page = PageResponse.of(farmerRepository.findAll(spec, pageable)
                .map(farmer -> toSummary(farmer, buyer)));

        if (!nearbyOnly) {
            return page;
        }

        List<FarmerSummaryResponse> filtered = page.content().stream()
                .filter(f -> f.distanceKm() == null || f.distanceKm() <= 50.0)
                .toList();
        return new PageResponse<>(filtered, page.page(), page.size(), filtered.size(), page.totalPages(), page.last());
    }

    @Override
    @Transactional(readOnly = true)
    public FarmerSummaryResponse getFarmer(UUID userId, UUID farmerId) {
        Buyer buyer = resolveBuyer(userId);
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> ResourceNotFoundException.of("Farmer", farmerId));
        if (!farmer.isVerified()) {
            throw ResourceNotFoundException.of("Farmer", farmerId);
        }
        return toSummary(farmer, buyer);
    }

    private Buyer resolveBuyer(UUID userId) {
        return buyerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found for current user"));
    }

    private BuyerProductResponse toResponse(Product product, Buyer buyer) {
        Category category = product.getCategory();
        Farmer farmer = product.getFarmer();
        boolean favorited = favoriteRepository.existsByBuyerIdAndProductId(buyer.getId(), product.getId());

        return new BuyerProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                new CategoryResponse(category.getId(), category.getName(), category.getDescription(), category.getIconUrl()),
                product.getUnit().name(),
                product.getPricePerUnit(),
                product.getQuantityAvailable(),
                product.isOrganic(),
                product.getHarvestDate(),
                product.getImageUrl(),
                product.getStatus().name(),
                farmer.getId(),
                farmer.getFarmName(),
                farmer.getFarmCity(),
                farmer.isVerified(),
                favorited
        );
    }

    private FarmerSummaryResponse toSummary(Farmer farmer, Buyer buyer) {
        long activeProducts = productRepository.countByFarmerIdAndStatus(farmer.getId(), ProductStatus.ACTIVE);
        Double distanceKm = haversineKm(
                buyer.getLatitude(), buyer.getLongitude(), farmer.getFarmLatitude(), farmer.getFarmLongitude());

        return new FarmerSummaryResponse(
                farmer.getId(),
                farmer.getFarmName(),
                farmer.getFarmCity(),
                farmer.getFarmState(),
                farmer.getPrimaryCropTypes(),
                farmer.getBio(),
                farmer.isVerified(),
                farmer.getFarmLatitude(),
                farmer.getFarmLongitude(),
                activeProducts,
                distanceKm
        );
    }

    private Double haversineKm(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
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
        return Math.round(earthRadiusKm * c * 10.0) / 10.0;
    }
}
