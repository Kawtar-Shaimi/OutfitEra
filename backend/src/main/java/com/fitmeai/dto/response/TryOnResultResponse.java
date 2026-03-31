package com.fitmeai.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import com.fitmeai.model.enums.AIModelName;
import com.fitmeai.model.enums.TryOnStatus;

@Data
public class TryOnResultResponse {
    private Long id;
    private String userImageUrl;
    private String resultImageUrl;
    private AIModelName modelName;
    private TryOnStatus status;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private Long clothingId;
    private String clothingName;
}
