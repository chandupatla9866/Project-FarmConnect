package com.farmconnect.controller;

import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.NotificationResponse;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> list(
            @AuthenticationPrincipal JwtPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(notificationService.list(principal.userId(), pageable)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", notificationService.unreadCount(principal.userId()))));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @AuthenticationPrincipal JwtPrincipal principal, @PathVariable UUID id) {
        notificationService.markRead(principal.userId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal JwtPrincipal principal) {
        notificationService.markAllRead(principal.userId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
