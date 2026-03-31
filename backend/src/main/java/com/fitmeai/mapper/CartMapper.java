package com.fitmeai.mapper;

import com.fitmeai.dto.response.CartItemResponse;
import com.fitmeai.model.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for converting CartItem entity to CartItemResponse DTO.
 */
@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(source = "clothing.id",        target = "clothingId")
    @Mapping(source = "clothing.name",       target = "clothingName")
    @Mapping(source = "clothing.imageUrl",   target = "imageUrl")
    @Mapping(source = "clothing.price",      target = "unitPrice")
    @Mapping(source = "clothing.stock",      target = "stock")
    CartItemResponse toResponse(CartItem cartItem);
}
