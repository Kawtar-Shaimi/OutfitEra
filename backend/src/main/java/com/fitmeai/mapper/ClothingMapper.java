package com.fitmeai.mapper;

import com.fitmeai.model.Clothing;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface ClothingMapper {

    Clothing toEntity(Clothing clothing);
}
