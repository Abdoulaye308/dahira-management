package com.dahira.demo.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class DashboardResponse {

    private long totalMembers;
    private long activeMembers;
    private long inactiveMembers;

    private long totalCategories;

    private long totalContributions;
    private long activeContributions;

    private BigDecimal totalExpected;
    private BigDecimal totalPaid;
    private BigDecimal totalRemaining;

    private long totalEvents;
    private long activeEvents;
}