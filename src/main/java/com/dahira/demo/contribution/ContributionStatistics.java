package com.dahira.demo.contribution;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ContributionStatistics {

    private Long contributionId;
    private String contributionName;

    private BigDecimal expectedAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;

    private long totalMembers;
    private long fullyPaid;
    private long partiallyPaid;
    private long unpaid;
}