package com.farmconnect.email;

import com.farmconnect.domain.enums.NotificationType;

public interface EmailService {

    /**
     * Fires the same email for every in-app notification event. No-ops silently
     * (fully inert) when SMTP credentials aren't configured, mirroring the
     * Google OAuth2 / Cloudinary pattern used elsewhere in this app.
     *
     * Takes plain strings rather than the JPA User entity on purpose: this runs
     * @Async on a separate thread, and touching a Hibernate-managed entity from
     * a thread other than the one holding its persistence context blows up with
     * "Illegal pop() with non-matching JdbcValuesSourceProcessingState".
     */
    void sendNotificationEmail(String recipientEmail, String recipientName, String title, String message, NotificationType type);
}
