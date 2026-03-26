package com.fitmeai.controller;

import com.fitmeai.dto.response.OrderResponse;
import com.fitmeai.model.User;
import com.fitmeai.service.AuthService;
import com.fitmeai.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.getUserOrders(user));
    }
}
