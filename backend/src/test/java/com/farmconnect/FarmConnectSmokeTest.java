package com.farmconnect;

import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.domain.enums.RoleName;
import com.farmconnect.dto.request.LoginRequest;
import com.farmconnect.dto.request.ProductRequest;
import com.farmconnect.dto.request.RegisterRequest;
import com.farmconnect.dto.response.AnalyticsSummaryResponse;
import com.farmconnect.dto.response.AuthResponse;
import com.farmconnect.dto.response.OrderDetailResponse;
import com.farmconnect.dto.response.ProductResponse;
import com.farmconnect.repository.*;
import com.farmconnect.service.AnalyticsService;
import com.farmconnect.service.AuthService;
import com.farmconnect.service.OrderService;
import com.farmconnect.service.ProductService;
import io.zonky.test.db.AutoConfigureEmbeddedDatabase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static io.zonky.test.db.AutoConfigureEmbeddedDatabase.DatabaseProvider.ZONKY;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end smoke test: boots the real Spring context + runs every Flyway migration
 * against a real embedded PostgreSQL instance (no Docker required), then exercises the
 * auth -> product -> order -> analytics flow through the actual service layer.
 *
 * Zonky only resets the embedded database once per test class, not per test method, so
 * @Transactional here rolls back each test's writes at the end of the method - that's
 * what keeps the two tests below from seeing each other's data.
 */
@SpringBootTest
@AutoConfigureEmbeddedDatabase(provider = ZONKY)
@Transactional
class FarmConnectSmokeTest {

    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FarmerRepository farmerRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;
    @Autowired
    private ProductService productService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private AnalyticsService analyticsService;

    @Test
    void flywaySeedDataLoadsCorrectly() {
        assertThat(roleRepository.findByName(RoleName.ROLE_FARMER)).isPresent();
        assertThat(categoryRepository.findAll()).hasSizeGreaterThanOrEqualTo(8);
        assertThat(farmerRepository.count()).isEqualTo(2);
        assertThat(productRepository.count()).isEqualTo(10);
        assertThat(orderRepository.count()).isEqualTo(4);

        boolean demoPasswordVerifies = passwordEncoder.matches("Farmer@123",
                userRepository.findByEmailIgnoreCase("farmer1@farmconnect.ai").orElseThrow().getPasswordHash());
        assertThat(demoPasswordVerifies).isTrue();
    }

    @Test
    void registerLoginProductAndOrderFlowWorksEndToEnd() {
        RegisterRequest register = new RegisterRequest(
                "Test Farmer", "smoketest.farmer@farmconnect.ai", "SecurePass123", "9999999999", "FARMER", null, null);
        AuthResponse registered = authService.register(register);
        assertThat(registered.token()).isNotBlank();
        assertThat(registered.user().roles()).contains("ROLE_FARMER");

        AuthResponse loggedIn = authService.login(new LoginRequest("smoketest.farmer@farmconnect.ai", "SecurePass123"));
        assertThat(loggedIn.token()).isNotBlank();

        UUID userId = registered.user().id();
        Farmer farmer = farmerRepository.findByUserId(userId).orElseThrow();
        assertThat(farmer.getFarmName()).contains("Test Farmer");

        UUID categoryId = categoryRepository.findAll().get(0).getId();
        ProductRequest productRequest = new ProductRequest();
        productRequest.setName("Smoke Test Carrots");
        productRequest.setDescription("Created by automated smoke test");
        productRequest.setCategoryId(categoryId);
        productRequest.setUnit("KG");
        productRequest.setPricePerUnit(new BigDecimal("19.99"));
        productRequest.setQuantityAvailable(new BigDecimal("50"));
        productRequest.setOrganic(true);
        productRequest.setHarvestDate(LocalDate.now());

        MockMultipartFile noImage = new MockMultipartFile("image", new byte[0]);
        ProductResponse product = productService.create(userId, productRequest, noImage);
        assertThat(product.id()).isNotNull();
        assertThat(product.status()).isEqualTo("ACTIVE");

        var page = productService.list(userId, null, null, PageRequest.of(0, 10));
        assertThat(page.content()).extracting(ProductResponse::name).contains("Smoke Test Carrots");

        // Exercise the seeded PENDING order accept -> ready-for-pickup transition for farmer1.
        UUID farmer1UserId = userRepository.findByEmailIgnoreCase("farmer1@farmconnect.ai").orElseThrow().getId();
        var pendingOrders = orderService.list(farmer1UserId, "PENDING", PageRequest.of(0, 10));
        assertThat(pendingOrders.content()).isNotEmpty();
        UUID pendingOrderId = pendingOrders.content().get(0).id();

        OrderDetailResponse accepted = orderService.accept(farmer1UserId, pendingOrderId);
        assertThat(accepted.status()).isEqualTo("ACCEPTED");

        OrderDetailResponse ready = orderService.markReadyForPickup(farmer1UserId, pendingOrderId);
        assertThat(ready.status()).isEqualTo("READY_FOR_PICKUP");

        // Seeded order FC-ORD-000003 (the only DELIVERED one) belongs to farmer2, not farmer1.
        UUID farmer2UserId = userRepository.findByEmailIgnoreCase("farmer2@farmconnect.ai").orElseThrow().getId();
        AnalyticsSummaryResponse summary = analyticsService.summary(farmer2UserId);
        assertThat(summary.totalRevenue()).isGreaterThan(BigDecimal.ZERO);
        assertThat(summary.totalOrders()).isEqualTo(1);
    }
}
