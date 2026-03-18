package com.fitmeai.service;

import com.fitmeai.dto.request.CartItemRequest;
import com.fitmeai.dto.response.CartItemResponse;
import com.fitmeai.dto.response.CartResponse;
import com.fitmeai.model.*;
import com.fitmeai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ClothingRepository clothingRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(User user) {
        Cart cart = getOrCreateCart(user);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(User user, CartItemRequest request) {
        Cart cart = getOrCreateCart(user);
        
        if (request.getClothingId() == null) {
            throw new RuntimeException("ID du vêtement manquant");
        }
        
        Clothing clothing = clothingRepository.findById(request.getClothingId())
                .orElseThrow(() -> new RuntimeException("Vêtement non trouvé"));

        // Décrémenter le stock AVANT d'ajouter au panier
        if (clothing.getStock() != null) {
            if (clothing.getStock() >= request.getQuantity()) {
                clothing.setStock(clothing.getStock() - request.getQuantity());
                clothingRepository.saveAndFlush(clothing);
            } else {
                throw new RuntimeException("Stock insuffisant. Disponible: " + clothing.getStock());
            }
        }

        // Vérifier si l'article existe déjà dans le panier avec la même taille
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getClothing().getId() != null
                        && item.getClothing().getId().equals(request.getClothingId())
                        && item.getSize().equals(request.getSize()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setClothing(clothing);
            newItem.setSize(request.getSize());
            newItem.setQuantity(request.getQuantity());
            cart.getItems().add(newItem);
        }

        // On sauvegarde et on force la synchronisation
        Cart savedCart = cartRepository.saveAndFlush(cart);
        return mapToResponse(savedCart);
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(User user, Long itemId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Article non trouvé dans le panier"));

        item.setQuantity(quantity);
        return mapToResponse(cartRepository.saveAndFlush(cart));
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        return mapToResponse(cartRepository.saveAndFlush(cart));
    }

    @Override
    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.saveAndFlush(cart);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.saveAndFlush(newCart);
                });
    }

    private CartResponse mapToResponse(Cart cart) {
        CartResponse response = new CartResponse();
        List<CartItemResponse> itemResponses = cart.getItems().stream().map(item -> {
            CartItemResponse ir = new CartItemResponse();
            ir.setId(item.getId());
            ir.setClothingId(item.getClothing().getId());
            ir.setClothingName(item.getClothing().getName());
            ir.setImageUrl(item.getClothing().getImageUrl());
            ir.setSize(item.getSize());
            ir.setQuantity(item.getQuantity());

            BigDecimal price = item.getClothing().getPrice() != null ? item.getClothing().getPrice() : BigDecimal.ZERO;
            ir.setUnitPrice(price);
            ir.setSubTotal(price.multiply(BigDecimal.valueOf(item.getQuantity())));
            return ir;
        }).collect(Collectors.toList());

        response.setItems(itemResponses);
        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalAmount(total);
        return response;
    }
}
