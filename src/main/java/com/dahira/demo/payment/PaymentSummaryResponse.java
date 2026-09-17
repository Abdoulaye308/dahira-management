package com.dahira.demo.payment;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class PaymentSummaryResponse {

    private Long memberContributionId;

    private Long memberId;
    private String firstName;
    private String lastName;
    private String phone;

    private Long contributionId;
    private String contributionName;

    private BigDecimal expectedAmount;
    private BigDecimal totalPaid;
    private BigDecimal remainingAmount;

    private String status;
}