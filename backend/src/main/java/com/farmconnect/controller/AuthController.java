package com.farmconnect.controller;

import com.farmconnect.dto.request.LoginRequest;
import com.farmconnect.dto.request.RegisterRequest;
import com.farmconnect.dto.request.SelectRoleRequest;
import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.AuthResponse;
import com.farmconnect.dto.response.UserSummaryResponse;
import com.farmconnect.security.JwtPrincipal;
import com.farmconnect.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> me(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser(principal.userId())));
    }

    @PostMapping("/select-role")
    public ResponseEntity<ApiResponse<AuthResponse>> selectRole(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody SelectRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.selectRole(authorizationHeader, request)));
    }
}
