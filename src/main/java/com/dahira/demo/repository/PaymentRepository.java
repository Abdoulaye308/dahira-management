package com.dahira.demo.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByMemberContributionId(
            Long memberContributionId
    );

    void deleteByMemberContributionId(
            Long memberContributionId
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.memberContribution.id = :memberContributionId
    """)
    BigDecimal getTotalPaid(
            @Param("memberContributionId") Long memberContributionId
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
        WHERE p.memberContribution.contribution.id = :contributionId
    """)
    BigDecimal getTotalPaidByContribution(
            @Param("contributionId") Long contributionId
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM Payment p
    """)
    BigDecimal getTotalPaid();

    // Vue synthétique : un membre + une cotisation = une seule ligne
    @Query("""
        SELECT new com.dahira.demo.payment.PaymentSummaryResponse(
            mc.id,
            mc.member.id,
            mc.member.firstName,
            mc.member.lastName,
            mc.member.phone,
            mc.contribution.id,
            mc.contribution.name,
            mc.expectedAmount,
            COALESCE(SUM(p.amount), 0),
            mc.expectedAmount - COALESCE(SUM(p.amount), 0),
            CASE
                WHEN COALESCE(SUM(p.amount), 0) = 0 THEN 'NON_PAYE'
                WHEN COALESCE(SUM(p.amount), 0) >= mc.expectedAmount THEN 'PAYE'
                ELSE 'PARTIEL'
            END
        )
        FROM MemberContribution mc
        LEFT JOIN Payment p
            ON p.memberContribution.id = mc.id
        GROUP BY
            mc.id,
            mc.member.id,
            mc.member.firstName,
            mc.member.lastName,
            mc.member.phone,
            mc.contribution.id,
            mc.contribution.name,
            mc.expectedAmount
        ORDER BY mc.member.lastName ASC
    """)
    List<PaymentSummaryResponse> getPaymentSummary();
}