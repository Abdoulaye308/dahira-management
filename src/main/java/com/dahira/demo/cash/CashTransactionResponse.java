package com.dahira.demo.cash;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class CashTransactionResponse {

    private Long id;

    private String type;

    private String title;

    private String description;

    private BigDecimal amount;

    private LocalDate date;

    private String source;
}