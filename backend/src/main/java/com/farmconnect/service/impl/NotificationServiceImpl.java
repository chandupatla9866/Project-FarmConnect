package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.Notification;
import com.farmconnect.domain.entity.User;
import com.farmconnect.domain.enums.NotificationType;
import com.farmconnect.dto.response.NotificationResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.email.EmailService;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.NotificationRepository;
import com.farmconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public void notify(User user, String title, String message, NotificationType type,
                        String relatedEntityType, UUID relatedEntityId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .build();
        notificationRepository.save(notification);
        emailService.sendNotificationEmail(user.getEmail(), user.getFullName(), title, message, type);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(UUID userId, Pageable pageable) {
        return PageResponse.of(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public long unreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Notification", notificationId));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for current user");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getTitle(), n.getMessage(), n.getType().name(),
                n.isRead(), n.getRelatedEntityType(), n.getRelatedEntityId(), n.getCreatedAt());
    }
}
