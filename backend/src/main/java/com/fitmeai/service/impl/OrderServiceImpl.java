package com.fitmeai.service.impl;

import com.fitmeai.service.OrderService;
import com.fitmeai.dto.response.OrderItemResponse;
import com.fitmeai.dto.response.OrderResponse;
import com.fitmeai.model.Order;
import com.fitmeai.model.User;
import com.fitmeai.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(User user) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setShippingAddress(order.getShippingAddress());
        response.setCreatedAt(order.getCreatedAt());

        if (order.getItems() != null) {
            List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
                OrderItemResponse ir = new OrderItemResponse();
                ir.setId(item.getId());
                
                if (item.getClothing() != null) {
                    ir.setClothingId(item.getClothing().getId());
                    ir.setClothingName(item.getClothing().getName());
                    ir.setImageUrl(item.getClothing().getImageUrl());
                }
                
                ir.setSize(item.getSize());
                ir.setQuantity(item.getQuantity());
                ir.setPriceAtOrder(item.getPriceAtOrder());
                
                BigDecimal price = item.getPriceAtOrder() != null ? item.getPriceAtOrder() : BigDecimal.ZERO;
                ir.setSubTotal(price.multiply(BigDecimal.valueOf(item.getQuantity())));
                return ir;
            }).collect(Collectors.toList());
            response.setItems(itemResponses);
        }

        return response;
    }
}
