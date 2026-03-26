package com.fitmeai.service;

import com.fitmeai.dto.request.UserUpdateRequest;
import com.fitmeai.dto.response.UserResponse;
import com.fitmeai.model.User;
import com.fitmeai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public UserResponse getCurrentUserResponse(User user) {
        return mapToResponse(user);
    }

    @Override
    public UserResponse updateProfile(User user, UserUpdateRequest request) {
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        User savedUser = userRepo.save(user);
        return mapToResponse(savedUser);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles())
                .build();
    }
}
