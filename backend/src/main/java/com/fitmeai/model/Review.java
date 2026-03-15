package com.fitmeai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "tryon_result_id", nullable = false)
    private TryOnResult tryOnResult;

    @Column(nullable = false)
    private Integer rating; // 1 à 5 étoiles

    private String comment;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // TODO: Ajouter validation pour s'assurer que rating est entre 1 et 5
    // TODO: Empêcher qu'un utilisateur note plusieurs fois le même essayage
    // TODO: Créer une notification pour l'auteur de l'essayage quand il reçoit un avis
}
