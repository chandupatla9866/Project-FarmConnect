package com.farmconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ProductStatusUpdateRequest(
        @NotBlank
        @Pattern(regexp = "ACTIVE|OUT_OF_STOCK|INACTIVE")
        String status
) {
}
