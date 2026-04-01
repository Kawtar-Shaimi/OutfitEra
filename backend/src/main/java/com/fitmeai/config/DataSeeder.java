package com.fitmeai.config;

import com.fitmeai.model.User;
import com.fitmeai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepo.count() == 0) {
            User admin = new User();
            admin.setEmail("admin@fitmeai.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("FitMeAI");
            admin.setRoles(Set.of("ADMIN"));
            userRepo.save(admin);
            System.out.println(">>> SEED: Admin user created (admin@fitmeai.com / admin123)");
        }
    }
}
