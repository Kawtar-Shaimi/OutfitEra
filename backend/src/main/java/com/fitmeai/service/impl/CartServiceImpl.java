package com.fitmeai.service.impl;

import com.fitmeai.mapper.CartMapper;
import com.fitmeai.service.CartService;
import com.fitmeai.service.NotificationService;
import lombok.extern.slf4j.Slf4j;

import com.fitmeai.dto.request.CartItemRequest;
import com.fitmeai.dto.response.CartItemResponse;
import com.fitmeai.dto.response.CartResponse;
import com.fitmeai.model.*;
import com.fitmeai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.stream.Collectors;
import com.fitmeai.model.enums.*;

@Slf4j
@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ClothingRepository clothingRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private CartMapper cartMapper;

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId()).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(User user) {
        Cart cart = getOrCreateCart(user);
        CartResponse response = new CartResponse();

        response.setItems(cart.getItems().stream().map(item -> {
            CartItemResponse ir = cartMapper.toResponse(item);
            // subTotal is computed (price * quantity) - not a direct field mapping
            BigDecimal price = ir.getUnitPrice() != null ? ir.getUnitPrice() : BigDecimal.ZERO;
            ir.setSubTotal(price.multiply(BigDecimal.valueOf(item.getQuantity())));
            return ir;
        }).collect(Collectors.toList()));

        BigDecimal total = response.getItems().stream()
                .map(CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalAmount(total);

        return response;
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(User user, CartItemRequest request) {
        Cart cart = getOrCreateCart(user);
        Clothing clothing = clothingRepository.findById(request.getClothingId())
                .orElseThrow(() -> new RuntimeException("Vêtement non trouvé"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getClothing().getId().equals(clothing.getId()) && i.getSize().equals(request.getSize()))
                .findFirst();

        Integer requestedTotal = existingItem.map(i -> i.getQuantity() + request.getQuantity()).orElse(request.getQuantity());
        if (clothing.getStock() == null || clothing.getStock() < requestedTotal) {
            throw new RuntimeException("Stock insuffisant pour l'article: " + clothing.getName());
        }

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setClothing(clothing);
            newItem.setSize(request.getSize());
            newItem.setQuantity(request.getQuantity());
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return getCart(user);
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(User user, Long itemId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Article non trouvé"));

        if (item.getClothing().getStock() == null || item.getClothing().getStock() < quantity) {
            throw new RuntimeException("Stock insuffisant");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return getCart(user);
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        cartItemRepository.deleteById(itemId);
        cartRepository.save(cart);
        return getCart(user);
    }

    @Override
    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Long checkout(User user, String paymentMethod) {
        log.info("Checkout started for user: {} (id: {})", user.getEmail(), user.getId());
        Cart cart = getOrCreateCart(user);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Le panier est vide");
        }

        Order order = new Order();
        order.setUser(user);
        order.setPaymentMethod(PaymentMethod.valueOf(paymentMethod.toUpperCase()));
        order.setStatus(OrderStatus.EN_ATTENTE);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            Clothing clothing = cartItem.getClothing();
            
            if (clothing.getStock() == null || clothing.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Stock insuffisant pour l'article: " + clothing.getName() + " (Reste: " + (clothing.getStock() != null ? clothing.getStock() : 0) + ")");
            }
            clothing.setStock(clothing.getStock() - cartItem.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setClothing(clothing);
            orderItem.setSize(cartItem.getSize());
            orderItem.setQuantity(cartItem.getQuantity());

            BigDecimal price = cartItem.getClothing().getPrice() != null ? cartItem.getClothing().getPrice() : BigDecimal.ZERO;
            orderItem.setPriceAtOrder(price);

            total = total.add(price.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            order.getItems().add(orderItem);
        }
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.saveAndFlush(order);

        cart.getItems().clear();
        cartRepository.saveAndFlush(cart);

        // Notify admins
        String adminMsg = "La commande #" + savedOrder.getId() + " a été passée par l'utilisateur #" + user.getId() + " (" + user.getFirstName() + " " + user.getLastName() + "). Elle nécessite une livraison.";
        log.info("Notifying admins: {}", adminMsg);
        notificationService.notifyAdmins(adminMsg, savedOrder.getId());

        return savedOrder.getId();
    }
}
