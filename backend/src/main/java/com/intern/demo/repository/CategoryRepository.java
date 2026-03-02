package com.intern.demo.repository;

import com.intern.demo.entity.Category;
import com.intern.demo.entity.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(CategoryType name);
    boolean existsByName(CategoryType name);
}
