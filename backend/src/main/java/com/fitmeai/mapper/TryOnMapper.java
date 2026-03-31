package com.fitmeai.mapper;

import com.fitmeai.dto.response.TryOnResultResponse;
import com.fitmeai.model.TryOnResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TryOnMapper {
    @Mapping(source = "clothing.id", target = "clothingId")
    @Mapping(source = "clothing.name", target = "clothingName")
    TryOnResultResponse toResponse(TryOnResult result);
}
