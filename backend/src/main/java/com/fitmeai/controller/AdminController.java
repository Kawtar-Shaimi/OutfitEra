package com.fitmeai.controller;

import com.fitmeai.model.Clothing;
import com.fitmeai.model.Order;
import com.fitmeai.repository.ClothingRepository;
import com.fitmeai.repository.OrderRepository;
import com.fitmeai.repository.UserRepository;
import com.fitmeai.service.FileStorageService;
import com.fitmeai.service.NotificationService;
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

    @Autowired
    private NotificationService notificationService;

    // ==================== STATISTIQUES ====================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        log.info("Request for admin stats received.");
        Map<String, Object> stats = new HashMap<>();

        try {
            long totalArticles = clothingRepo.count();
            long totalCommandes = orderRepo.count();
            long totalUtilisateurs = userRepo.count();
            
            // For calculating status counts and revenue, we use a lighter query or direct count
            long enCours = orderRepo.countByStatus("PENDING") + 
                          orderRepo.countByStatus("PAID") + 
                          orderRepo.countByStatus("SHIPPED") + 
                          orderRepo.countByStatus("EN_ATTENTE");
            
            long livrees = orderRepo.countByStatus("DELIVERED");
            
            BigDecimal revenue = orderRepo.sumDeliveredAmount();
            if (revenue == null) revenue = BigDecimal.ZERO;

            stats.put("totalArticles", totalArticles);
            stats.put("totalCommandes", totalCommandes);
            stats.put("commandesEnCours", enCours);
            stats.put("commandesLivrees", livrees);
            stats.put("totalUtilisateurs", totalUtilisateurs);
            stats.put("chiffreAffaires", revenue);

            log.info("Successfully calculated stats: Articles={}, Orders={}, Users={}, Revenue={}", 
                    totalArticles, totalCommandes, totalUtilisateurs, revenue);
        } catch (Exception e) {
            log.error("Fatal error during stats calculation: {}", e.getMessage());
            // Return zeros instead of empty response/error to keep dashboard stable
            stats.put("totalArticles", 0);
            stats.put("totalCommandes", 0);
            stats.put("commandesEnCours", 0);
            stats.put("commandesLivrees", 0);
            stats.put("totalUtilisateurs", 0);
            stats.put("chiffreAffaires", BigDecimal.ZERO);
        }

        return ResponseEntity.ok(stats);
    }

    // ==================== GESTION ARTICLES ====================

    @GetMapping("/clothing")
    public ResponseEntity<List<Clothing>> getAllClothing() {
        return ResponseEntity.ok(clothingRepo.findAll());
    }

    @GetMapping("/clothing/{id}")
    public ResponseEntity<Clothing> getClothing(@PathVariable Long id) {
        java.util.Objects.requireNonNull(id);
        return clothingRepo.findById(id)
                .map(clothing -> ResponseEntity.ok(clothing))
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
            return ResponseEntity.badRequest().<Clothing>build();
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
                log.info("Article modifié: id={}", saved.getId());

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
        List<Order> orders = orderRepo.findAllByOrderByCreatedAtDesc();
        log.info("Admin fetching all orders. Found: {}", orders.size());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        java.util.Objects.requireNonNull(id);
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
        java.util.Objects.requireNonNull(id);
        return orderRepo.findById(id).map(order -> {
            String newStatus = status.toUpperCase();
            // Valider le statut
            if (!List.of("PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED").contains(newStatus)) {
                return ResponseEntity.badRequest().<Order>build();
            }

            order.setStatus(newStatus);
            Order saved = orderRepo.save(order);
            log.info("Commande {} -> statut: {}", id, newStatus);

            // Notify user
            String userMsg = "Le statut de votre commande #" + id + " est passé à : " + newStatus;
            notificationService.createNotification(order.getUser(), "ORDER_STATUS_CHANGED", userMsg, id);

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
