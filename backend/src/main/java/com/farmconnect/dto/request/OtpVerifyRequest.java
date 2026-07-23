package com.farmconnect.dto.request;

import jakarta.validation.constraints.NotBlank;

public record OtpVerifyRequest(@NotBlank String otp) {
}
