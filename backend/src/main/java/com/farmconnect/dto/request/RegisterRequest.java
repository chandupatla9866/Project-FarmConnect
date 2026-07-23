package com.farmconnect.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 150)
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        String phone,

        @NotBlank(message = "Role is required")
        @Pattern(regexp = "FARMER|BUYER|DELIVERY", message = "Role must be FARMER, BUYER, or DELIVERY")
        String role,

        // Required only when role = BUYER
        String buyerType,
        String businessName
) {
}
