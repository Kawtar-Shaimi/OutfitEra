package com.intern.demo.dto.request;

import com.intern.demo.entity.enums.CategoryType;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryRequest {
    private CategoryType name;
    private String description;
}
