package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.Category;
import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.domain.entity.Product;
import com.farmconnect.domain.enums.ProductStatus;
import com.farmconnect.domain.enums.ProductUnit;
import com.farmconnect.dto.request.ProductRequest;
import com.farmconnect.dto.request.ProductStatusUpdateRequest;
import com.farmconnect.dto.response.CategoryResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.dto.response.ProductResponse;
import com.farmconnect.exception.BadRequestException;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.CategoryRepository;
import com.farmconnect.repository.FarmerRepository;
import com.farmconnect.repository.ProductRepository;
import com.farmconnect.service.ProductService;
import com.farmconnect.storage.ImageStorageService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final FarmerRepository farmerRepository;
    private final CategoryRepository categoryRepository;
    private final ImageStorageService imageStorageService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> list(UUID userId, String status, UUID categoryId, Pageable pageable) {
        Farmer farmer = resolveFarmer(userId);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("farmer").get("id"), farmer.getId()));
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), ProductStatus.valueOf(status.toUpperCase())));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return PageResponse.of(productRepository.findAll(spec, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse get(UUID userId, UUID productId) {
        Farmer farmer = resolveFarmer(userId);
        return toResponse(findOwnedProduct(farmer, productId));
    }

    @Override
    @Transactional
    public ProductResponse create(UUID userId, ProductRequest request, MultipartFile image) {
        Farmer farmer = resolveFarmer(userId);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> ResourceNotFoundException.of("Category", request.getCategoryId()));

        Product product = Product.builder()
                .farmer(farmer)
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .unit(parseUnit(request.getUnit()))
                .pricePerUnit(request.getPricePerUnit())
                .quantityAvailable(request.getQuantityAvailable())
                .organic(request.isOrganic())
                .harvestDate(request.getHarvestDate())
                .status(ProductStatus.ACTIVE)
                .build();

        if (image != null && !image.isEmpty()) {
            product.setImageUrl(imageStorageService.upload(image, "products"));
        }

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(UUID userId, UUID productId, ProductRequest request, MultipartFile image) {
        Farmer farmer = resolveFarmer(userId);
        Product product = findOwnedProduct(farmer, productId);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> ResourceNotFoundException.of("Category", request.getCategoryId()));

        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setUnit(parseUnit(request.getUnit()));
        product.setPricePerUnit(request.getPricePerUnit());
        product.setQuantityAvailable(request.getQuantityAvailable());
        product.setOrganic(request.isOrganic());
        product.setHarvestDate(request.getHarvestDate());

        if (image != null && !image.isEmpty()) {
            product.setImageUrl(imageStorageService.upload(image, "products"));
        }

        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID productId) {
        Farmer farmer = resolveFarmer(userId);
        Product product = findOwnedProduct(farmer, productId);
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductResponse updateStatus(UUID userId, UUID productId, ProductStatusUpdateRequest request) {
        Farmer farmer = resolveFarmer(userId);
        Product product = findOwnedProduct(farmer, productId);
        product.setStatus(ProductStatus.valueOf(request.status().toUpperCase()));
        return toResponse(productRepository.save(product));
    }

    private Farmer resolveFarmer(UUID userId) {
        return farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for current user"));
    }

    private Product findOwnedProduct(Farmer farmer, UUID productId) {
        return productRepository.findByIdAndFarmerId(productId, farmer.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Product", productId));
    }

    private ProductUnit parseUnit(String unit) {
        try {
            return ProductUnit.valueOf(unit.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid unit: " + unit);
        }
    }

    private ProductResponse toResponse(Product product) {
        Category category = product.getCategory();
        return new ProductResponse(
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
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
