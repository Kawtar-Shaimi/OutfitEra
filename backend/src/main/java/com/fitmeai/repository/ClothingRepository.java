package com.fitmeai.repository;

import com.fitmeai.model.Clothing;
import com.fitmeai.model.enums.Category;
import com.fitmeai.model.enums.Gender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClothingRepository extends JpaRepository<Clothing, Long> {
    List<Clothing> findByCategory(Category category);
    List<Clothing> findByGender(Gender gender);
    List<Clothing> findByGenderAndCategory(Gender gender, Category category);
    List<Clothing> findByStockGreaterThan(Integer stock);
    long count();
}
