package com.dahira.demo.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    @NotBlank(message = "Le nom d'utilisateur est obligatoire.")
    private String username;

    @NotBlank(message = "L'email est obligatoire.")
    @Email(message = "L'email est invalide.")
    private String email;

    @NotNull(message = "Le rôle est obligatoire.")
    private Role role;
}