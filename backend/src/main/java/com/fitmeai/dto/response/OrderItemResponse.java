package com.fitmeai.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemResponse {
    private Long id;
    private Long clothingId;
    private String clothingName;
    private String imageUrl;
    private String size;
    private Integer quantity;
    private BigDecimal priceAtOrder;
    private BigDecimal subTotal;
    
    // Frontend Admin expects item.clothing.name
    private ClothingInfo clothing;

    @Data
    public static class ClothingInfo {
        private String name;
        private BigDecimal price;
    }
}
