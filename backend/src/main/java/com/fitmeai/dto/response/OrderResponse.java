package com.fitmeai.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fitmeai.model.enums.OrderStatus;
import com.fitmeai.model.enums.PaymentMethod;

@Data
public class OrderResponse {
    private Long id;
    private UserResponse user;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
