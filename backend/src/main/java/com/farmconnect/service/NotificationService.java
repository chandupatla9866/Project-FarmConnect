package com.farmconnect.service;

import com.farmconnect.domain.entity.User;
import com.farmconnect.domain.enums.NotificationType;
import com.farmconnect.dto.response.NotificationResponse;
import com.farmconnect.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {

    void notify(User user, String title, String message, NotificationType type,
                String relatedEntityType, UUID relatedEntityId);

    PageResponse<NotificationResponse> list(UUID userId, Pageable pageable);

    long unreadCount(UUID userId);

    void markRead(UUID userId, UUID notificationId);

    void markAllRead(UUID userId);
}
