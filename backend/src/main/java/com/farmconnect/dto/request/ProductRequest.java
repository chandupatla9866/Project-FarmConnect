package com.farmconnect.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Bound via @ModelAttribute from multipart/form-data so the image file can travel
 * alongside the product fields in a single request.
 */
@Data
@NoArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 150)
    private String name;

    private String description;

    @NotNull(message = "categoryId is required")
    private UUID categoryId;

    @NotBlank(message = "unit is required")
    private String unit;

    @NotNull(message = "pricePerUnit is required")
    @DecimalMin(value = "0.0", message = "pricePerUnit must be >= 0")
    private BigDecimal pricePerUnit;

    @NotNull(message = "quantityAvailable is required")
    @DecimalMin(value = "0.0", message = "quantityAvailable must be >= 0")
    private BigDecimal quantityAvailable;

    private boolean organic;

    private LocalDate harvestDate;
}
