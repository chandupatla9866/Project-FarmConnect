package com.farmconnect.dto.response;

import java.util.UUID;

public record DeliveryProfileResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String profileImageUrl,
        boolean approved
) {
}
