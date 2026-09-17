package com.dahira.demo.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MemberSummaryResponse {

    private Long memberId;

    private String firstName;
    private String lastName;

    private BigDecimal totalExpected;
    private BigDecimal totalPaid;
    private BigDecimal totalRemaining;

    private long totalContributions;
    private long paidContributions;
    private long partialContributions;
    private long unpaidContributions;
}