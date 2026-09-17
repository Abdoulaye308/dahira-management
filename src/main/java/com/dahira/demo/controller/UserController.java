package com.dahira.demo.controller;
import com.dahira.demo.user.UserUpdateRequest;

import com.dahira.demo.user.User;
import com.dahira.demo.user.UserRepository;
import com.dahira.demo.user.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserResponse>> findAll() {

        List<UserResponse> users = userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findById(
            @PathVariable Long id
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilisateur introuvable."
                        )
                );

        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<UserResponse> toggleEnabled(
            @PathVariable Long id
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilisateur introuvable."
                        )
                );

        user.setEnabled(!user.isEnabled());

        return ResponseEntity.ok(
                toResponse(userRepository.save(user))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilisateur introuvable."
                        )
                );

        userRepository.delete(user);

        return ResponseEntity.noContent().build();
    }

    private UserResponse toResponse(User user) {

        Long memberId = null;
        String memberName = null;

        if (user.getMember() != null) {
            memberId = user.getMember().getId();

            memberName =
                    user.getMember().getFirstName()
                            + " "
                            + user.getMember().getLastName();
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                memberId,
                memberName,
                user.isEnabled()
        );
    }
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilisateur introuvable."
                        )
                );

        // Vérifier si le username est déjà utilisé
        if (!user.getUsername().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {

            throw new RuntimeException(
                    "Ce nom d'utilisateur est déjà utilisé."
            );
        }

        // Vérifier si l'email est déjà utilisé
        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException(
                    "Cet email est déjà utilisé."
            );
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        return ResponseEntity.ok(
                toResponse(userRepository.save(user))
        );
    }
}