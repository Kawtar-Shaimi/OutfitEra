package com.fitmeai.repository;

import com.fitmeai.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserId(Long userId);

    Optional<Favorite> findByUserIdAndClothingId(Long userId, Long clothingId);

    boolean existsByUserIdAndClothingId(Long userId, Long clothingId);

    void deleteByUserIdAndClothingId(Long userId, Long clothingId);
}
