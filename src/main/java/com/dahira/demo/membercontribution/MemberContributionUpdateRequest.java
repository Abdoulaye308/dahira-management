package com.dahira.demo.membercontribution;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MemberContributionUpdateRequest {

    @NotNull(message = "Le montant attendu est obligatoire.")
    @Positive(message = "Le montant attendu doit être supérieur à 0.")
    private BigDecimal expectedAmount;
}