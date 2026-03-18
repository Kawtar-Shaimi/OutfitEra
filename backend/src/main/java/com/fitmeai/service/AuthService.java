package com.fitmeai.service;

import com.fitmeai.dto.request.AuthRequest;
import com.fitmeai.dto.response.AuthResponse;
import com.fitmeai.dto.request.RegisterRequest;
import com.fitmeai.model.User;
import com.fitmeai.repository.UserRepository;
import com.fitmeai.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private UserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());

        Set<String> roles = new HashSet<>();
        roles.add("USER");
        user.setRoles(roles);

        userRepo.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public AuthResponse login(AuthRequest req) {
        long start = System.currentTimeMillis();
        log.info("=== LOGIN START === email: {}", req.getEmail());

        try {
            log.info("Step 1: Authenticating...");
            long t1 = System.currentTimeMillis();
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            log.info("Step 1 done in {}ms", System.currentTimeMillis() - t1);

            log.info("Step 2: Loading user details...");
            long t2 = System.currentTimeMillis();
            UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
            log.info("Step 2 done in {}ms", System.currentTimeMillis() - t2);

            log.info("Step 3: Generating token...");
            long t3 = System.currentTimeMillis();
            String token = jwtUtil.generateToken(userDetails);
            log.info("Step 3 done in {}ms", System.currentTimeMillis() - t3);

            log.info("Step 4: Finding user...");
            long t4 = System.currentTimeMillis();
            User user = userRepo.findByEmail(req.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            log.info("Step 4 done in {}ms", System.currentTimeMillis() - t4);

            log.info("=== LOGIN SUCCESS === total: {}ms", System.currentTimeMillis() - start);
            return new AuthResponse(token, user.getEmail(), user.getFirstName(), user.getLastName());
        } catch (Exception e) {
            log.error("=== LOGIN FAILED === total: {}ms, error: {}", System.currentTimeMillis() - start, e.getMessage());
            throw e;
        }
    }

    public User getCurrentUser() {
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = authentication.getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}
