package com.fitmeai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

import com.fitmeai.model.enums.AIModelName;
import com.fitmeai.model.enums.TryOnStatus;

@Entity
@Table(name = "tryon_results")
@Data
@NoArgsConstructor
public class TryOnResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "clothing_id")
    private Clothing clothing;

    @Column(nullable = false)
    private String userImageUrl;

    @Column(nullable = false)
    private String resultImageUrl;

    @Enumerated(EnumType.STRING)
    private AIModelName modelName; // IDM-VTON, FASHN AI

    @Enumerated(EnumType.STRING)
    private TryOnStatus status; // PENDING, APPROVED, REJECTED

    private boolean isPublic = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = TryOnStatus.PENDING;
        }
    }
}
