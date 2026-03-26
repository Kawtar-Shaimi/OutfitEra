package com.fitmeai.service;

import com.fitmeai.dto.request.UserUpdateRequest;
import com.fitmeai.dto.response.UserResponse;
import com.fitmeai.model.User;

public interface UserService {
    UserResponse getCurrentUserResponse(User user);
    UserResponse updateProfile(User user, UserUpdateRequest request);
}
