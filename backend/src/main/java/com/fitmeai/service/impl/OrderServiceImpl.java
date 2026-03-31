package com.fitmeai.service.impl;

import com.fitmeai.mapper.OrderMapper;
import com.fitmeai.service.OrderService;
import com.fitmeai.dto.response.OrderItemResponse;
import com.fitmeai.dto.response.OrderResponse;
import com.fitmeai.model.Order;
import com.fitmeai.model.OrderItem;
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

    @Autowired
    private OrderMapper orderMapper;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(User user) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = orderMapper.toResponse(order);

        if (order.getItems() != null) {
            List<OrderItemResponse> itemResponses = order.getItems().stream()
                    .map(this::mapItemToResponse)
                    .collect(Collectors.toList());
            response.setItems(itemResponses);
        }

        return response;
    }

    private OrderItemResponse mapItemToResponse(OrderItem item) {
        OrderItemResponse ir = orderMapper.toItemResponse(item);
        // subTotal is computed (priceAtOrder * quantity) - not mappable directly
        BigDecimal price = ir.getPriceAtOrder() != null ? ir.getPriceAtOrder() : BigDecimal.ZERO;
        ir.setSubTotal(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        return ir;
    }
}
