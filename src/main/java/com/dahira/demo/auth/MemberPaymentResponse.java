package com.dahira.demo.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class MemberPaymentResponse {

    private Long paymentId;

    private Long contributionId;
    private String contributionName;

    private BigDecimal expectedAmount;
    private BigDecimal amountPaid;
    private BigDecimal remainingAmount;

    private String status;

    private LocalDate paymentDate;
}