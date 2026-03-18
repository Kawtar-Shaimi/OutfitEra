package com.fitmeai.controller;

import com.fitmeai.dto.request.CartItemRequest;
import com.fitmeai.dto.response.CartResponse;
import com.fitmeai.model.User;
import com.fitmeai.service.AuthService;
import com.fitmeai.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<CartResponse> getMyCart() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addItem(@RequestBody CartItemRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.addItemToCart(user, request));
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Long itemId, 
            @RequestParam Integer quantity) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.updateItemQuantity(user, itemId, quantity));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long itemId) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.removeItemFromCart(user, itemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        User user = authService.getCurrentUser();
        cartService.clearCart(user);
        return ResponseEntity.noContent().build();
    }
}
