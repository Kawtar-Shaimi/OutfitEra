package com.fitmeai.dto.request;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String paymentMethod; // "CARD" or "CASH"
}
