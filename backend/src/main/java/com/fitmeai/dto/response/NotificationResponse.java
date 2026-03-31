package com.fitmeai.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import com.fitmeai.model.enums.NotificationType;

@Data
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String message;
    private Long targetId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
