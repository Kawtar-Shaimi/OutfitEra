package com.fitmeai.service;

import com.fitmeai.dto.response.OrderResponse;
import com.fitmeai.model.User;
import java.util.List;

public interface OrderService {
    List<OrderResponse> getUserOrders(User user);
}
