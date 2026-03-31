package com.fitmeai.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {
    @NotNull(message = "L'identifiant du vêtement est obligatoire")
    private Long clothingId;

    @NotBlank(message = "La taille est obligatoire")
    private String size;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être supérieure ou égale à 1")
    private Integer quantity;
}
