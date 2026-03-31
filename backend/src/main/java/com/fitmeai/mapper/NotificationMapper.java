package com.fitmeai.mapper;

import com.fitmeai.dto.response.NotificationResponse;
import com.fitmeai.model.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toResponse(Notification notification);
}
