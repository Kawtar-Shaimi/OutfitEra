package com.fitmeai.controller;

import com.fitmeai.model.Clothing;
import com.fitmeai.repository.ClothingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fitmeai.model.enums.*;

import java.util.List;

@RestController
@RequestMapping("/api/clothing")
public class ClothingController {

    @Autowired
    private ClothingRepository clothingRepo;

    @GetMapping
    public ResponseEntity<List<Clothing>> getAll() {
        return ResponseEntity.ok(clothingRepo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Clothing> getById(@PathVariable Long id) {
        return clothingRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Clothing>> getByCategory(@PathVariable String category) {
        try {
            return ResponseEntity.ok(clothingRepo.findByCategory(Category.valueOf(category.toUpperCase())));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
