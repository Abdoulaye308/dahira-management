package com.dahira.demo.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MemberContributionSummaryResponse {

    private Long memberContributionId;
    private Long contributionId;
    private String contributionName;

    private BigDecimal expectedAmount;
    private BigDecimal totalPaid;
    private BigDecimal remainingAmount;

    private String status;
}