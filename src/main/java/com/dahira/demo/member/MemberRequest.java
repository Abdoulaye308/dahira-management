package com.dahira.demo.member;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MemberRequest {

    @NotBlank(message = "Le prénom est obligatoire.")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire.")
    private String lastName;

    @NotBlank(message = "Le téléphone est obligatoire.")
    @Pattern(
            regexp = "^[0-9]{9}$",
            message = "Le numéro doit contenir 9 chiffres."
    )
    private String phone;

    @NotBlank(message = "Le sexe est obligatoire.")
    private String gender;

    @NotNull(message = "La catégorie est obligatoire.")
    private Long categoryId;

    private LocalDate joinDate;

    private String status;
}