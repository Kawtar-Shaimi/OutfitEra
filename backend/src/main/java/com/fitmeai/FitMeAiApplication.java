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
            com.fitmeai.repository.OrderRepository orderRepo) {
        return args -> {
            System.out.println("\n" + "=".repeat(30));
            System.out.println("   DIAGNOSTIC DE DÉMARRAGE");
            System.out.println("=".repeat(30));
            System.out.println("Commandes en base : " + orderRepo.count());
            System.out.println("Admins trouvés    : " + userRepo.findAdmins().size());
            userRepo.findAdmins().forEach(a -> System.out.println(" - " + a.getEmail()));
            System.out.println("=".repeat(30) + "\n");
        };
    }
}
