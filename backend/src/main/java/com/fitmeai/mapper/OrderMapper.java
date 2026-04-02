package com.fitmeai.mapper;

import com.fitmeai.dto.response.OrderItemResponse;
import com.fitmeai.dto.response.OrderResponse;
import com.fitmeai.model.Order;
import com.fitmeai.model.OrderItem;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface OrderMapper {

    OrderResponse toResponse(Order order);

    List<OrderResponse> toResponseList(List<Order> orders);

    @Mapping(source = "clothing.id",       target = "clothingId")
    @Mapping(source = "clothing.name",     target = "clothingName")
    @Mapping(source = "clothing.imageUrl", target = "imageUrl")
    @Mapping(source = "clothing.name",     target = "clothing.name")
    @Mapping(source = "priceAtOrder",      target = "clothing.price")
    OrderItemResponse toItemResponse(OrderItem orderItem);

    @AfterMapping
    default void calculateSubTotal(@MappingTarget OrderItemResponse response, OrderItem item) {
        if (item.getPriceAtOrder() != null && item.getQuantity() != null) {
            response.setSubTotal(item.getPriceAtOrder().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
    }
}
