package com.intern.demo.service;

import com.intern.demo.dto.request.CategoryRequest;
import com.intern.demo.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    CategoryResponse getById(Long id);
    List<CategoryResponse> getAll();
    CategoryResponse update(Long id, CategoryRequest request);
    void delete(Long id);
}
