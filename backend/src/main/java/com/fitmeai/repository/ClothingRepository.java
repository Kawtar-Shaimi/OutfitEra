package com.fitmeai.repository;

import com.fitmeai.model.Clothing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClothingRepository extends JpaRepository<Clothing, Long> {
    List<Clothing> findByCategory(String category);
    List<Clothing> findByGender(String gender);
    List<Clothing> findByGenderAndCategory(String gender, String category);
    List<Clothing> findByStockGreaterThan(Integer stock);
    long count();
}
