package com.farmconnect.email;

import com.farmconnect.domain.enums.NotificationType;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final boolean emailConfigured;
    private final String fromAddress;
    private final String frontendBaseUrl;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${app.mail.username}") String username,
            @Value("${app.mail.from}") String fromAddress,
            @Value("${app.frontend-base-url}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.emailConfigured = StringUtils.hasText(username);
        this.fromAddress = fromAddress;
        this.frontendBaseUrl = frontendBaseUrl;

        if (!emailConfigured) {
            log.warn("Email is not configured (MAIL_USERNAME missing) - notification emails will not be sent");
        }
    }

    @Override
    @Async("emailExecutor")
    public void sendNotificationEmail(String recipientEmail, String recipientName, String title, String message, NotificationType type) {
        if (!emailConfigured || !StringUtils.hasText(recipientEmail)) {
            return;
        }
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(recipientEmail);
            helper.setSubject("FarmConnect - " + title);
            helper.setText(EmailTemplateBuilder.build(recipientName, title, message, type, frontendBaseUrl), true);
            mailSender.send(mimeMessage);
            log.info("Sent {} notification email to {}", type, recipientEmail);
        } catch (Exception ex) {
            log.error("Failed to send notification email to {}", recipientEmail, ex);
        }
    }
}
