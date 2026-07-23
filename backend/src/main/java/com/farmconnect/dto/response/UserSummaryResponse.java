package com.farmconnect.dto.response;

import java.util.Set;
import java.util.UUID;

public record UserSummaryResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String profileImageUrl,
        Set<String> roles,
        boolean approved
) {
}
