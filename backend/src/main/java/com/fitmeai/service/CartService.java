package com.fitmeai.service;

import com.fitmeai.dto.request.CartItemRequest;
import com.fitmeai.dto.response.CartResponse;
import com.fitmeai.model.User;

public interface CartService {
    CartResponse getCart(User user);
    CartResponse addItemToCart(User user, CartItemRequest request);
    CartResponse updateItemQuantity(User user, Long itemId, Integer quantity);
    CartResponse removeItemFromCart(User user, Long itemId);
    void clearCart(User user);
}
