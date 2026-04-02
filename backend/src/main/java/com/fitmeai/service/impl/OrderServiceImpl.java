package com.fitmeai.service.impl;

import com.fitmeai.mapper.OrderMapper;
import com.fitmeai.service.OrderService;
import com.fitmeai.dto.response.OrderResponse;
import com.fitmeai.model.Order;
import com.fitmeai.model.User;
import com.fitmeai.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderMapper orderMapper;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(User user) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return orderMapper.toResponseList(orders);
    }
}
