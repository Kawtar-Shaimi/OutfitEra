package com.fitmeai.controller;

import com.fitmeai.model.Clothing;
import com.fitmeai.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<Clothing>> getFavorites(Authentication auth) {
        List<Clothing> favorites = favoriteService.getUserFavorites(auth.getName());
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getFavoriteIds(Authentication auth) {
        List<Long> ids = favoriteService.getUserFavoriteIds(auth.getName());
        return ResponseEntity.ok(ids);
    }

    @PostMapping("/{clothingId}")
    public ResponseEntity<?> addFavorite(Authentication auth, @PathVariable Long clothingId) {
        try {
            favoriteService.addFavorite(auth.getName(), clothingId);
            return ResponseEntity.ok(Map.of("message", "Added to favorites"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{clothingId}")
    public ResponseEntity<?> removeFavorite(Authentication auth, @PathVariable Long clothingId) {
        favoriteService.removeFavorite(auth.getName(), clothingId);
        return ResponseEntity.ok(Map.of("message", "Removed from favorites"));
    }

    @GetMapping("/check/{clothingId}")
    public ResponseEntity<Boolean> checkFavorite(Authentication auth, @PathVariable Long clothingId) {
        boolean isFavorite = favoriteService.isFavorite(auth.getName(), clothingId);
        return ResponseEntity.ok(isFavorite);
    }
}
