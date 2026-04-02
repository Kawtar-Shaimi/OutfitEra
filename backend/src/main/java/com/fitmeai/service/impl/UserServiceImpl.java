package com.fitmeai.service.impl;

import com.fitmeai.service.UserService;
import com.fitmeai.dto.request.UserUpdateRequest;
import com.fitmeai.dto.response.UserResponse;
import com.fitmeai.model.User;
import com.fitmeai.repository.UserRepository;
import com.fitmeai.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private UserMapper userMapper;

    @Override
    public UserResponse getCurrentUserResponse(User user) {
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateProfile(User user, UserUpdateRequest request) {
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        User savedUser = userRepo.save(user);
        return userMapper.toResponse(savedUser);
    }
}
