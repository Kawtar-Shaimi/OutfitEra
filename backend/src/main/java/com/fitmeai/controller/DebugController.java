package com.fitmeai.controller;

import com.fitmeai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/admins")
    public List<Map<String, Object>> getAdmins() {
        return userRepo.findAll().stream()
                .filter(u -> u.getRoles().contains("ADMIN") || u.getRoles().contains("ROLE_ADMIN"))
                .map(u -> Map.of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "roles", u.getRoles()
                ))
                .collect(Collectors.toList());
    }


    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return userRepo.findAll().stream()
                .map(u -> Map.of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "roles", u.getRoles()
                ))
                .collect(Collectors.toList());
    }
}
