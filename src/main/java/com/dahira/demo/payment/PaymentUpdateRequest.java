package com.dahira.demo.payment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class PaymentUpdateRequest {

    @NotNull(message = "Le montant du paiement est obligatoire.")
    @Positive(message = "Le montant doit être supérieur à zéro.")
    private BigDecimal amount;

    @NotNull(message = "La date du paiement est obligatoire.")
    private LocalDate paymentDate;
}