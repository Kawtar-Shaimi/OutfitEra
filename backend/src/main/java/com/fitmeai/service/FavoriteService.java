package com.fitmeai.service;

import com.fitmeai.model.Clothing;
import com.fitmeai.model.Favorite;
import com.fitmeai.model.User;
import com.fitmeai.repository.ClothingRepository;
import com.fitmeai.repository.FavoriteRepository;
import com.fitmeai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClothingRepository clothingRepository;

    public List<Clothing> getUserFavorites(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(Favorite::getClothing)
                .collect(Collectors.toList());
    }

    public List<Long> getUserFavoriteIds(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(f -> f.getClothing().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    public Favorite addFavorite(String email, Long clothingId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Clothing clothing = clothingRepository.findById(clothingId)
                .orElseThrow(() -> new RuntimeException("Clothing not found"));

        if (favoriteRepository.existsByUserIdAndClothingId(user.getId(), clothingId)) {
            throw new RuntimeException("Already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setClothing(clothing);

        return favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String email, Long clothingId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        favoriteRepository.deleteByUserIdAndClothingId(user.getId(), clothingId);
    }

    public boolean isFavorite(String email, Long clothingId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.existsByUserIdAndClothingId(user.getId(), clothingId);
    }
}
