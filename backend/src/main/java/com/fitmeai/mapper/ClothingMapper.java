package com.fitmeai.mapper;

import com.fitmeai.model.Clothing;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for Clothing entity.
 * Used to convert Clothing entities, e.g. when needed for response projections.
 */
@Mapper(componentModel = "spring")
public interface ClothingMapper {

    /**
     * Identity mapping (pass-through) - useful as a base for future
     * ClothingRequest → Clothing mappings when request DTOs are introduced.
     */
    Clothing toEntity(Clothing clothing);
}
