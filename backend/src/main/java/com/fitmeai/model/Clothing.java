package com.fitmeai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "clothing")
@Data
@NoArgsConstructor
public class Clothing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String category; // TOP, BOTTOM, DRESS, SHOES, ACCESSORY

    @Column(nullable = false)
    private String gender; // HOMME, FEMME, UNISEX

    @Column(nullable = false)
    private String garmentType; // upper_body, lower_body, dresses (pour l'IA)

    @Column(nullable = false)
    private BigDecimal price;

    @ElementCollection
    @CollectionTable(name = "clothing_sizes", joinColumns = @JoinColumn(name = "clothing_id"))
    @Column(name = "size")
    private Set<String> availableSizes = new HashSet<>();

    private Integer stock;

    @Column(nullable = false)
    private String imageUrl;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
