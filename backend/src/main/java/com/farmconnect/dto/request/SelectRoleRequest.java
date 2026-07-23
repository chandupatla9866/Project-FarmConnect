package com.farmconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SelectRoleRequest(
        @NotBlank
        @Pattern(regexp = "FARMER|BUYER|DELIVERY", message = "Role must be FARMER, BUYER, or DELIVERY")
        String role,

        String buyerType,
        String businessName
) {
}
