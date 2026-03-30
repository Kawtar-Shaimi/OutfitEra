package com.fitmeai.service;

import com.fitmeai.model.*;
import com.fitmeai.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import com.fitmeai.service.impl.CartServiceImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour CartServiceImpl.
 * Vérifie les règles métier du panier sans accès à la base de données.
 */
@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ClothingRepository clothingRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CartServiceImpl cartService;


    // TEST 3 : Checkout avec un panier vide doit lever une exception

    @Test
    @DisplayName("Le checkout doit échouer si le panier est vide")
    void checkout_shouldThrow_whenCartIsEmpty() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setEmail("kawtar@outfitera.com");

        Cart emptyCart = new Cart();
        emptyCart.setUser(user);
        emptyCart.setItems(new ArrayList<>());

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(emptyCart));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.checkout(user, "CARD"));

        assertEquals("Le panier est vide", exception.getMessage());
        verify(orderRepository, never()).saveAndFlush(any(Order.class));
    }
}
