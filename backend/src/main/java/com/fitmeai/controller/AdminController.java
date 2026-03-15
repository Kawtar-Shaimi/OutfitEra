package com.fitmeai.controller;

import com.fitmeai.model.Clothing;
import com.fitmeai.model.Order;
import com.fitmeai.model.User;
import com.fitmeai.repository.ClothingRepository;
import com.fitmeai.repository.OrderRepository;
import com.fitmeai.repository.UserRepository;
import com.fitmeai.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ClothingRepository clothingRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private FileStorageService fileStorage;

    // ==================== STATISTIQUES ====================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalArticles", clothingRepo.count());
        stats.put("totalCommandes", orderRepo.countAll());
        stats.put("commandesEnCours", orderRepo.countByStatus("PENDING") + orderRepo.countByStatus("PAID") + orderRepo.countByStatus("SHIPPED"));
        stats.put("commandesLivrees", orderRepo.countByStatus("DELIVERED"));
        stats.put("totalUtilisateurs", userRepo.count());

        Double revenue = orderRepo.sumDeliveredAmount();
        stats.put("chiffreAffaires", revenue != null ? revenue : 0.0);

        return ResponseEntity.ok(stats);
    }

    // ==================== GESTION ARTICLES ====================

    @GetMapping("/clothing")
    public ResponseEntity<List<Clothing>> getAllClothing() {
        return ResponseEntity.ok(clothingRepo.findAll());
    }

    @GetMapping("/clothing/{id}")
    public ResponseEntity<Clothing> getClothing(@PathVariable Long id) {
        return clothingRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/clothing")
    public ResponseEntity<Clothing> createClothing(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("gender") String gender,
            @RequestParam("garmentType") String garmentType,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam("sizes") String sizes,
            @RequestParam("image") MultipartFile image
    ) {
        try {
            String imageUrl = fileStorage.saveFile(image);

            Clothing clothing = new Clothing();
            clothing.setName(name);
            clothing.setDescription(description);
            clothing.setCategory(category);
            clothing.setGender(gender);
            clothing.setGarmentType(garmentType);
            clothing.setPrice(price);
            clothing.setStock(stock);
            clothing.setImageUrl(imageUrl);

            Set<String> sizeSet = new HashSet<>(Arrays.asList(sizes.split(",")));
            clothing.setAvailableSizes(sizeSet);

            Clothing saved = clothingRepo.save(clothing);
            log.info("Article créé: {} (id={})", saved.getName(), saved.getId());

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Erreur création article: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/clothing/{id}")
    public ResponseEntity<Clothing> updateClothing(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("gender") String gender,
            @RequestParam("garmentType") String garmentType,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stock") Integer stock,
            @RequestParam("sizes") String sizes,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        return clothingRepo.findById(id).map(clothing -> {
            try {
                clothing.setName(name);
                clothing.setDescription(description);
                clothing.setCategory(category);
                clothing.setGender(gender);
                clothing.setGarmentType(garmentType);
                clothing.setPrice(price);
                clothing.setStock(stock);

                Set<String> sizeSet = new HashSet<>(Arrays.asList(sizes.split(",")));
                clothing.setAvailableSizes(sizeSet);

                if (image != null && !image.isEmpty()) {
                    String imageUrl = fileStorage.saveFile(image);
                    clothing.setImageUrl(imageUrl);
                }

                Clothing saved = clothingRepo.save(clothing);
                log.info("Article modifié: {} (id={})", saved.getName(), saved.getId());

                return ResponseEntity.ok(saved);
            } catch (Exception e) {
                log.error("Erreur modification article: {}", e.getMessage());
                return ResponseEntity.badRequest().<Clothing>build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/clothing/{id}")
    public ResponseEntity<Void> deleteClothing(@PathVariable Long id) {
        if (clothingRepo.existsById(id)) {
            clothingRepo.deleteById(id);
            log.info("Article supprimé: id={}", id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== GESTION COMMANDES ====================

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepo.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return orderRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/orders/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(orderRepo.findByStatusOrderByCreatedAtDesc(status.toUpperCase()));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam("status") String status
    ) {
        return orderRepo.findById(id).map(order -> {
            String newStatus = status.toUpperCase();
            // Valider le statut
            if (!List.of("PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED").contains(newStatus)) {
                return ResponseEntity.badRequest().<Order>build();
            }

            order.setStatus(newStatus);
            Order saved = orderRepo.save(order);
            log.info("Commande {} -> statut: {}", id, newStatus);

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
