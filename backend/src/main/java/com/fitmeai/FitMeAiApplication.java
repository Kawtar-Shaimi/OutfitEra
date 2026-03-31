package com.fitmeai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FitMeAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(FitMeAiApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner diagnosticRunner(
            com.fitmeai.repository.UserRepository userRepo, 
            com.fitmeai.repository.OrderRepository orderRepo,
            com.fitmeai.mapper.OrderMapper orderMapper) {
        return args -> {
            System.out.println("\n" + "=".repeat(30));
            System.out.println("   DIAGNOSTIC DE DÉMARRAGE");
            System.out.println("=".repeat(30));
            long orderCount = orderRepo.count();
            System.out.println("Commandes en base : " + orderCount);
            System.out.println("Admins trouvés    : " + userRepo.findAdmins().size());
            userRepo.findAdmins().forEach(a -> System.out.println(" - " + a.getEmail()));
            
            if (orderCount > 0) {
                System.out.println("Test de mapping de la première commande...");
                orderRepo.findAll().stream().findFirst().ifPresent(o -> {
                    try {
                        com.fitmeai.dto.response.OrderResponse r = orderMapper.toResponse(o);
                        System.out.println("Mapping OK pour #" + o.getId() + " (Items: " + (r.getItems() != null ? r.getItems().size() : 0) + ")");
                    } catch (Exception e) {
                        System.err.println("ERREUR MAPPING COMMANDE: " + e.getMessage());
                        e.printStackTrace();
                    }
                });
            }
            System.out.println("=".repeat(30) + "\n");
        };
    }
}
