package com.dahira.demo.contribution;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ContributionStatisticsResponse {

    private Long contributionId;
    private String contributionName;

    private BigDecimal totalExpected;
    private BigDecimal totalPaid;
    private BigDecimal totalRemaining;

    private long paidMembers;
    private long partialMembers;
    private long unpaidMembers;
}