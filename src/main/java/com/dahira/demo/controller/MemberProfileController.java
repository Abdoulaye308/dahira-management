package com.dahira.demo.controller;
import com.dahira.demo.auth.MemberPaymentResponse;
import com.dahira.demo.payment.Payment;
import com.dahira.demo.payment.PaymentRepository;
import com.dahira.demo.auth.MemberProfileResponse;
import com.dahira.demo.auth.MemberSummaryResponse;
import com.dahira.demo.member.Member;
import com.dahira.demo.membercontribution.MemberContribution;
import com.dahira.demo.membercontribution.MemberContributionRepository;
import com.dahira.demo.user.User;
import com.dahira.demo.auth.MemberContributionSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.dahira.demo.payment.Payment;
import com.dahira.demo.payment.PaymentRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberProfileController {

    private final MemberContributionRepository memberContributionRepository;
    private final PaymentRepository paymentRepository;
    @GetMapping("/profile")
    public ResponseEntity<MemberProfileResponse> profile(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();
        Member member = user.getMember();

        if (member == null) {
            throw new RuntimeException(
                    "Aucun membre associé à ce compte."
            );
        }

        MemberProfileResponse response =
                new MemberProfileResponse(
                        user.getId(),
                        member.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        member.getFirstName(),
                        member.getLastName(),
                        member.getPhone(),
                        member.getGender(),
                        member.getStatus()
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/contributions")
    public ResponseEntity<List<MemberContributionSummaryResponse>> getContributions(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        Member member = user.getMember();

        if (member == null) {
            throw new RuntimeException("Aucun membre associé à ce compte.");
        }

        List<MemberContribution> memberContributions =
                memberContributionRepository.findByMemberId(member.getId());

        List<MemberContributionSummaryResponse> response =
                memberContributions.stream()
                        .map(mc -> {

                            BigDecimal totalPaid =
                                    paymentRepository.getTotalPaid(mc.getId());

                            BigDecimal expectedAmount =
                                    mc.getExpectedAmount();

                            BigDecimal remainingAmount =
                                    expectedAmount.subtract(totalPaid);

                            String status;

                            if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
                                status = "NON_PAYE";
                            } else if (totalPaid.compareTo(expectedAmount) >= 0) {
                                status = "PAYE";
                            } else {
                                status = "PARTIEL";
                            }

                            return new MemberContributionSummaryResponse(
                                    mc.getId(),
                                    mc.getContribution().getId(),
                                    mc.getContribution().getName(),
                                    expectedAmount,
                                    totalPaid,
                                    remainingAmount,
                                    status
                            );
                        })
                        .toList();

        return ResponseEntity.ok(response);
    }
    @GetMapping("/payments")
    public ResponseEntity<List<MemberPaymentResponse>> payments(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();
        Member member = user.getMember();

        if (member == null) {
            throw new RuntimeException(
                    "Aucun membre associé à ce compte."
            );
        }

        List<MemberContribution> contributions =
                memberContributionRepository.findByMemberId(member.getId());

        List<MemberPaymentResponse> response = new ArrayList<>();

        for (MemberContribution contribution : contributions) {

            List<Payment> payments =
                    paymentRepository.findByMemberContributionId(
                            contribution.getId()
                    );

            BigDecimal totalPaid =
                    paymentRepository.getTotalPaid(contribution.getId());

            BigDecimal remaining =
                    contribution.getExpectedAmount()
                            .subtract(totalPaid);

            String status;

            if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
                status = "NON_PAYE";
            } else if (totalPaid.compareTo(
                    contribution.getExpectedAmount()) >= 0) {
                status = "PAYE";
            } else {
                status = "PARTIEL";
            }

            for (Payment payment : payments) {

                response.add(
                        new MemberPaymentResponse(
                                payment.getId(),
                                contribution.getContribution().getId(),
                                contribution.getContribution().getName(),
                                contribution.getExpectedAmount(),
                                payment.getAmount(),
                                remaining,
                                status,
                                payment.getPaymentDate()
                        )
                );
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<MemberSummaryResponse> summary(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();
        Member member = user.getMember();

        if (member == null) {
            throw new RuntimeException(
                    "Aucun membre associé à ce compte."
            );
        }

        List<MemberContribution> contributions =
                memberContributionRepository.findByMemberId(
                        member.getId()
                );

        BigDecimal totalExpected = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;

        long paidContributions = 0;
        long partialContributions = 0;
        long unpaidContributions = 0;

        for (MemberContribution contribution : contributions) {

            BigDecimal expected =
                    contribution.getExpectedAmount();

            BigDecimal paid =
                    paymentRepository.getTotalPaid(
                            contribution.getId()
                    );

            totalExpected = totalExpected.add(expected);
            totalPaid = totalPaid.add(paid);

            if (paid.compareTo(BigDecimal.ZERO) == 0) {
                unpaidContributions++;

            } else if (paid.compareTo(expected) >= 0) {
                paidContributions++;

            } else {
                partialContributions++;
            }
        }

        BigDecimal totalRemaining =
                totalExpected.subtract(totalPaid);

        MemberSummaryResponse response =
                new MemberSummaryResponse(
                        member.getId(),
                        member.getFirstName(),
                        member.getLastName(),
                        totalExpected,
                        totalPaid,
                        totalRemaining,
                        contributions.size(),
                        paidContributions,
                        partialContributions,
                        unpaidContributions
                );

        return ResponseEntity.ok(response);
    }
}