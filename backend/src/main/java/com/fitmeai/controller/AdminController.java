package com.fitmeai.controller;

import com.fitmeai.model.Clothing;
import com.fitmeai.model.Notification;
import com.fitmeai.model.Order;
import com.fitmeai.model.OrderItem;
import com.fitmeai.model.User;
import com.fitmeai.repository.ClothingRepository;
import com.fitmeai.repository.OrderRepository;
import com.fitmeai.repository.UserRepository;
import com.fitmeai.service.FileStorageService;
import com.fitmeai.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fitmeai.dto.response.OrderItemResponse;
import com.fitmeai.dto.response.OrderResponse;
import com.fitmeai.mapper.OrderMapper;
import com.fitmeai.model.enums.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

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
            long enCours = orderRepo.countByStatus(OrderStatus.PENDING) + 
                          orderRepo.countByStatus(OrderStatus.PAID) + 
                          orderRepo.countByStatus(OrderStatus.SHIPPED);
            
            long livrees = orderRepo.countByStatus(OrderStatus.DELIVERED);
            
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
            @RequestParam("category") Category category,
            @RequestParam("gender") Gender gender,
            @RequestParam("garmentType") GarmentType garmentType,
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
            @RequestParam("category") Category category,
            @RequestParam("gender") Gender gender,
            @RequestParam("garmentType") GarmentType garmentType,
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

    @Autowired
    private OrderMapper orderMapper;

    // ==================== GESTION COMMANDES ====================

    @Transactional(readOnly = true)
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<Order> orders = orderRepo.findAllByOrderByCreatedAtDesc();
        log.info("Admin fetching all orders. Found: {}", orders.size());
        
        List<OrderResponse> responses = new ArrayList<>();
        for (Order o : orders) {
            try {
                OrderResponse res = new OrderResponse();
                res.setId(o.getId());
                res.setTotalAmount(o.getTotalAmount());
                
                // Normalisation du statut pour le frontend (toujours PENDING pour les deux cas internes)
                if (o.getStatus() == OrderStatus.PENDING || o.getStatus() == OrderStatus.EN_ATTENTE) {
                    res.setStatus(OrderStatus.PENDING);
                } else {
                    res.setStatus(o.getStatus());
                }
                
                res.setPaymentMethod(o.getPaymentMethod());
                res.setShippingAddress(o.getShippingAddress());
                res.setCreatedAt(o.getCreatedAt());
                
                if (o.getUser() != null) {
                    com.fitmeai.dto.response.UserResponse ur = new com.fitmeai.dto.response.UserResponse();
                    ur.setId(o.getUser().getId());
                    ur.setEmail(o.getUser().getEmail());
                    ur.setFirstName(o.getUser().getFirstName());
                    ur.setLastName(o.getUser().getLastName());
                    res.setUser(ur);
                }
                
                List<OrderItemResponse> itemResponses = new ArrayList<>();
                if (o.getItems() != null) {
                    for (OrderItem oi : o.getItems()) {
                        OrderItemResponse ir = new OrderItemResponse();
                        ir.setId(oi.getId());
                        ir.setQuantity(oi.getQuantity());
                        ir.setSize(oi.getSize());
                        ir.setPriceAtOrder(oi.getPriceAtOrder());
                        
                        if (oi.getClothing() != null) {
                            ir.setClothingId(oi.getClothing().getId());
                            ir.setClothingName(oi.getClothing().getName());
                            ir.setImageUrl(oi.getClothing().getImageUrl());
                            
                            OrderItemResponse.ClothingInfo ci = new OrderItemResponse.ClothingInfo();
                            ci.setName(oi.getClothing().getName());
                            ci.setPrice(oi.getClothing().getPrice());
                            ir.setClothing(ci);
                        }
                        
                        BigDecimal price = oi.getPriceAtOrder() != null ? oi.getPriceAtOrder() : BigDecimal.ZERO;
                        ir.setSubTotal(price.multiply(BigDecimal.valueOf(oi.getQuantity())));
                        itemResponses.add(ir);
                    }
                }
                res.setItems(itemResponses);
                responses.add(res);
            } catch (Exception e) {
                log.error("Manual mapping failed for order #{}", o.getId(), e);
            }
        }
        
        return ResponseEntity.ok(responses);
    }

    @Transactional(readOnly = true)
    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        java.util.Objects.requireNonNull(id);
        return orderRepo.findById(id)
                .map(order -> {
                    OrderResponse res = orderMapper.toResponse(order);
                    // Calculate subTotals
                    if (order.getItems() != null && res.getItems() != null) {
                        for (int i = 0; i < order.getItems().size(); i++) {
                            OrderItem item = order.getItems().get(i);
                            OrderItemResponse itemRes = res.getItems().get(i);
                            BigDecimal price = itemRes.getPriceAtOrder() != null ? itemRes.getPriceAtOrder() : BigDecimal.ZERO;
                            itemRes.setSubTotal(price.multiply(BigDecimal.valueOf(item.getQuantity())));
                        }
                    }
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional(readOnly = true)
    @GetMapping("/orders/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable String status) {
        try {
            List<Order> orders = orderRepo.findByStatusOrderByCreatedAtDesc(OrderStatus.valueOf(status.toUpperCase()));
            List<OrderResponse> responses = orders.stream()
                    .map(order -> {
                        OrderResponse res = orderMapper.toResponse(order);
                        if (order.getItems() != null && res.getItems() != null) {
                            for (int i = 0; i < order.getItems().size(); i++) {
                                OrderItem item = order.getItems().get(i);
                                OrderItemResponse itemRes = res.getItems().get(i);
                                BigDecimal price = itemRes.getPriceAtOrder() != null ? itemRes.getPriceAtOrder() : BigDecimal.ZERO;
                                itemRes.setSubTotal(price.multiply(BigDecimal.valueOf(item.getQuantity())));
                            }
                        }
                        return res;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam("status") String status
    ) {
        java.util.Objects.requireNonNull(id);
        return orderRepo.findById(id).map(order -> {
            String newStatus = status.toUpperCase();
            if (newStatus.equals("PENDING")) {
                newStatus = "PENDING";
            }
            OrderStatus orderStatus;
            try {
                orderStatus = OrderStatus.valueOf(newStatus);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().<Order>build();
            }

            order.setStatus(orderStatus);
            Order saved = orderRepo.save(order);
            log.info("Commande {} -> statut: {}", id, newStatus);

            // Notify user
            String userMsg = "Le statut de votre commande #" + id + " est passé à : " + newStatus;
            notificationService.createNotification(order.getUser(), NotificationType.ORDER_STATUS_CHANGED, userMsg, id);

            // Return DTO manually mapped
            OrderResponse res = new OrderResponse();
            res.setId(saved.getId());
            res.setTotalAmount(saved.getTotalAmount());
            res.setStatus(saved.getStatus());
            res.setPaymentMethod(saved.getPaymentMethod());
            res.setShippingAddress(saved.getShippingAddress());
            res.setCreatedAt(saved.getCreatedAt());
            
            if (saved.getUser() != null) {
                com.fitmeai.dto.response.UserResponse ur = new com.fitmeai.dto.response.UserResponse();
                ur.setId(saved.getUser().getId());
                ur.setEmail(saved.getUser().getEmail());
                ur.setFirstName(saved.getUser().getFirstName());
                ur.setLastName(saved.getUser().getLastName());
                res.setUser(ur);
            }
            
            List<OrderItemResponse> itemResponses = new ArrayList<>();
            if (saved.getItems() != null) {
                for (OrderItem oi : saved.getItems()) {
                    OrderItemResponse ir = new OrderItemResponse();
                    ir.setId(oi.getId());
                    ir.setQuantity(oi.getQuantity());
                    ir.setSize(oi.getSize());
                    ir.setPriceAtOrder(oi.getPriceAtOrder());
                    if (oi.getClothing() != null) {
                        ir.setClothingId(oi.getClothing().getId());
                        ir.setClothingName(oi.getClothing().getName());
                        OrderItemResponse.ClothingInfo ci = new OrderItemResponse.ClothingInfo();
                        ci.setName(oi.getClothing().getName());
                        ci.setPrice(oi.getClothing().getPrice());
                        ir.setClothing(ci);
                    }
                    BigDecimal price = oi.getPriceAtOrder() != null ? oi.getPriceAtOrder() : BigDecimal.ZERO;
                    ir.setSubTotal(price.multiply(BigDecimal.valueOf(oi.getQuantity())));
                    itemResponses.add(ir);
                }
            }
            res.setItems(itemResponses);

            return ResponseEntity.ok(res);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== DEBOGAGE ====================
    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugState() {
        Map<String, Object> debug = new HashMap<>();
        try {
            long totalOrders = orderRepo.count();
            long totalUsers = userRepo.count();
            List<User> admins = userRepo.findAdmins();
            
            debug.put("db_totalOrders", totalOrders);
            debug.put("db_totalUsers", totalUsers);
            debug.put("db_adminCount", admins.size());
            debug.put("db_adminEmails", admins.stream().map(User::getEmail).collect(Collectors.toList()));
            
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth != null) {
                debug.put("current_user", auth.getName());
                debug.put("current_authorities", auth.getAuthorities().stream()
                    .map(oa -> oa.getAuthority()).collect(Collectors.toList()));
            }

            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            return ResponseEntity.status(500).body(debug);
        }
    }
}
