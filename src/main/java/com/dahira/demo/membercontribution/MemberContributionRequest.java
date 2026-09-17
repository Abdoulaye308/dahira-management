package com.dahira.demo.membercontribution;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MemberContributionRequest {

    @NotNull(message = "Le membre est obligatoire.")
    private Long memberId;

    @NotNull(message = "La contribution est obligatoire.")
    private Long contributionId;

    @NotNull(message = "Le montant attendu est obligatoire.")
    @Positive(message = "Le montant attendu doit être supérieur à 0.")
    private BigDecimal expectedAmount;
}