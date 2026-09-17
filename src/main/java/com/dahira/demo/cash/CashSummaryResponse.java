package com.dahira.demo.cash;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CashSummaryResponse {

    private BigDecimal totalPayments;
    private BigDecimal totalIncomes;
    private BigDecimal totalExpenses;
    private BigDecimal totalEntries;
    private BigDecimal cashBalance;
}