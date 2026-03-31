package com.fitmeai.mapper;

import com.fitmeai.dto.response.OrderItemResponse;
import com.fitmeai.dto.response.OrderResponse;
import com.fitmeai.model.Order;
import com.fitmeai.model.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderResponse toResponse(Order order);

    @Mapping(source = "clothing.id",       target = "clothingId")
    @Mapping(source = "clothing.name",     target = "clothingName")
    @Mapping(source = "clothing.imageUrl", target = "imageUrl")
    OrderItemResponse toItemResponse(OrderItem orderItem);
}
