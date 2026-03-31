package com.fitmeai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank(message = "Le mode de paiement est obligatoire")
    private String paymentMethod; // "CARD" or "CASH"
}
