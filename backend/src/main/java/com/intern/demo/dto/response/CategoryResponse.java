package com.intern.demo.dto.response;

import com.intern.demo.entity.enums.CategoryType;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryResponse {
    private Long id;
    private CategoryType name;
    private String description;
}
