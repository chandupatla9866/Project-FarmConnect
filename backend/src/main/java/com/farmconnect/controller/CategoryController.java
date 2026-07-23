package com.farmconnect.controller;

import com.farmconnect.dto.response.ApiResponse;
import com.farmconnect.dto.response.CategoryResponse;
import com.farmconnect.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> listAll() {
        List<CategoryResponse> categories = categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getIconUrl()))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }
}
