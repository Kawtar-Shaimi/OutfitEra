package com.fitmeai.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemResponse {
    private Long id;
    private Long clothingId;
    private String clothingName;
    private String imageUrl;
    private String size;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subTotal;
}
