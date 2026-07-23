package com.farmconnect.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        String code,
        String message,
        Instant timestamp,
        List<FieldError> fieldErrors
) {
    public record FieldError(String field, String message) {
    }

    public static ApiError of(String code, String message) {
        return new ApiError(code, message, Instant.now(), null);
    }

    public static ApiError ofFieldErrors(String message, Map<String, String> fieldErrors) {
        List<FieldError> errors = fieldErrors.entrySet().stream()
                .map(e -> new FieldError(e.getKey(), e.getValue()))
                .toList();
        return new ApiError("VALIDATION_ERROR", message, Instant.now(), errors);
    }
}
