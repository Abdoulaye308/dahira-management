package com.dahira.demo.dashboard;

import com.dahira.demo.category.CategoryRepository;
import com.dahira.demo.contribution.ContributionRepository;
import com.dahira.demo.member.MemberRepository;
import com.dahira.demo.membercontribution.MemberContributionRepository;
import com.dahira.demo.payment.PaymentRepository;
import com.dahira.demo.event.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;
    private final ContributionRepository contributionRepository;
    private final MemberContributionRepository memberContributionRepository;
    private final PaymentRepository paymentRepository;
    private final EventRepository eventRepository;

    public DashboardResponse getDashboard() {

        long totalMembers = memberRepository.count();
        long activeMembers =
                memberRepository.findByStatus("ACTIVE").size();
        long inactiveMembers =
                memberRepository.findByStatus("INACTIVE").size();

        long totalCategories = categoryRepository.count();

        long totalContributions =
                contributionRepository.count();

        long activeContributions =
                contributionRepository.findByStatus("ACTIVE").size();

        BigDecimal totalExpected =
                memberContributionRepository.getTotalExpected();

        BigDecimal totalPaid =
                paymentRepository.getTotalPaid();

        BigDecimal totalRemaining =
                totalExpected.subtract(totalPaid);

        long totalEvents = eventRepository.count();

        long activeEvents =
                eventRepository.findByStatus("ACTIVE").size();

        return new DashboardResponse(
                totalMembers,
                activeMembers,
                inactiveMembers,
                totalCategories,
                totalContributions,
                activeContributions,
                totalExpected,
                totalPaid,
                totalRemaining,
                totalEvents,
                activeEvents
        );
    }
}