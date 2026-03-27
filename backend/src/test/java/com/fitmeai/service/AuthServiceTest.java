package com.fitmeai.service;

import com.fitmeai.dto.request.RegisterRequest;
import com.fitmeai.model.User;
import com.fitmeai.repository.UserRepository;
import com.fitmeai.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour AuthService.
 * Utilise Mockito pour simuler les dépendances sans base de données.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepo;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private AuthService authService;

    // ─────────────────────────────────────────────────────────────
    // TEST 1 : Inscription avec un email déjà utilisé
    // ─────────────────────────────────────────────────────────────
    @Test
    @DisplayName("L'inscription doit échouer si l'email est déjà utilisé")
    void register_shouldThrow_whenEmailAlreadyExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@outfitera.com");
        request.setPassword("password123");
        request.setFirstName("Kawtar");
        request.setLastName("Shaimi");

        when(userRepo.existsByEmail("test@outfitera.com")).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.register(request));

        assertEquals("Email déjà utilisé", exception.getMessage());
        verify(userRepo, never()).save(any(User.class));
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2 : Inscription avec un email valide (succès)
    // ─────────────────────────────────────────────────────────────
    @Test
    @DisplayName("L'inscription doit réussir avec un email valide")
    void register_shouldSucceed_withValidEmail() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("nouveau@outfitera.com");
        request.setPassword("password123");
        request.setFirstName("Kawtar");
        request.setLastName("Shaimi");

        User savedUser = new User();
        savedUser.setEmail("nouveau@outfitera.com");
        savedUser.setFirstName("Kawtar");
        savedUser.setLastName("Shaimi");

        UserDetails mockUserDetails = mock(UserDetails.class);

        when(userRepo.existsByEmail(anyString())).thenReturn(false);
        when(encoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepo.save(any(User.class))).thenReturn(savedUser);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(mockUserDetails);
        when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("mock-jwt-token");

        // Act
        var response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        verify(userRepo, times(1)).save(any(User.class));
    }
}
