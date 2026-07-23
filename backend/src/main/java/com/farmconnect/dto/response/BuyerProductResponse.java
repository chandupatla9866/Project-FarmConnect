package com.farmconnect.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record BuyerProductResponse(
        UUID id,
        String name,
        String description,
        CategoryResponse category,
        String unit,
        BigDecimal pricePerUnit,
        BigDecimal quantityAvailable,
        boolean organic,
        LocalDate harvestDate,
        String imageUrl,
        String status,
        UUID farmerId,
        String farmName,
        String farmCity,
        boolean farmerVerified,
        boolean favorited
) {
}
