package com.fitmeai.controller;

import com.fitmeai.dto.request.UserUpdateRequest;
import com.fitmeai.dto.response.UserResponse;
import com.fitmeai.model.User;
import com.fitmeai.service.AuthService;
import com.fitmeai.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(userService.getCurrentUserResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(@Valid @RequestBody UserUpdateRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }
}
