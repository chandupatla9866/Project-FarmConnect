package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.Buyer;
import com.farmconnect.domain.entity.Category;
import com.farmconnect.domain.entity.Favorite;
import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.domain.entity.Product;
import com.farmconnect.dto.response.BuyerProductResponse;
import com.farmconnect.dto.response.CategoryResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.exception.BadRequestException;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.BuyerRepository;
import com.farmconnect.repository.FavoriteRepository;
import com.farmconnect.repository.ProductRepository;
import com.farmconnect.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final BuyerRepository buyerRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BuyerProductResponse> list(UUID userId, Pageable pageable) {
        Buyer buyer = resolveBuyer(userId);
        return PageResponse.of(favoriteRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId(), pageable)
                .map(favorite -> toResponse(favorite.getProduct())));
    }

    @Override
    @Transactional
    public void add(UUID userId, UUID productId) {
        Buyer buyer = resolveBuyer(userId);
        if (favoriteRepository.existsByBuyerIdAndProductId(buyer.getId(), productId)) {
            return;
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", productId));

        favoriteRepository.save(Favorite.builder().buyer(buyer).product(product).build());
    }

    @Override
    @Transactional
    public void remove(UUID userId, UUID productId) {
        Buyer buyer = resolveBuyer(userId);
        favoriteRepository.deleteByBuyerIdAndProductId(buyer.getId(), productId);
    }

    private Buyer resolveBuyer(UUID userId) {
        return buyerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Buyer profile not found for current user"));
    }

    private BuyerProductResponse toResponse(Product product) {
        Category category = product.getCategory();
        Farmer farmer = product.getFarmer();
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
                true
        );
    }
}
