package com.dahira.demo.config;

import com.dahira.demo.user.Role;
import com.dahira.demo.user.User;
import com.dahira.demo.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository) {

        return args -> {

            if (userRepository.existsByEmail("admin@dahira.com")) {
                return;
            }

            User admin = User.builder()
                    .username("admin")
                    .email("admin@dahira.com")
                    .password(
                            passwordEncoder.encode("Admin@1234")
                    )
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();

            userRepository.save(admin);

            System.out.println("=================================");
            System.out.println("COMPTE ADMIN CRÉÉ");
            System.out.println("Email : admin@dahira.com");
            System.out.println("Mot de passe : Admin@1234");
            System.out.println("=================================");
        };
    }
}