package com.farmconnect.dto.response;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String title,
        String message,
        String type,
        boolean isRead,
        String relatedEntityType,
        UUID relatedEntityId,
        Instant createdAt
) {
}
