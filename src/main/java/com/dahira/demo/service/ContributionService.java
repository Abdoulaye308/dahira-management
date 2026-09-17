package com.dahira.demo.contribution;

import com.dahira.demo.membercontribution.MemberContribution;
import com.dahira.demo.membercontribution.MemberContributionRepository;
import com.dahira.demo.payment.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContributionService {

    private final ContributionRepository contributionRepository;
    private final MemberContributionRepository memberContributionRepository;
    private final PaymentRepository paymentRepository;

    public Contribution create(Contribution contribution) {
        return contributionRepository.save(contribution);
    }

    public List<Contribution> findAll() {
        return contributionRepository.findAll();
    }

    public Contribution findById(Long id) {
        return contributionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Contribution introuvable."
                ));
    }

    public Contribution update(Long id, Contribution contribution) {

        Contribution existing = findById(id);

        existing.setName(contribution.getName());
        existing.setDescription(contribution.getDescription());
        existing.setTargetAmount(contribution.getTargetAmount());
        existing.setStartDate(contribution.getStartDate());
        existing.setEndDate(contribution.getEndDate());
        existing.setStatus(contribution.getStatus());

        return contributionRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {

        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cotisation introuvable.")
                );

        List<MemberContribution> memberContributions =
                memberContributionRepository.findByContributionId(id);

        for (MemberContribution memberContribution : memberContributions) {

            paymentRepository.deleteByMemberContributionId(
                    memberContribution.getId()
            );
        }

        memberContributionRepository.deleteByContributionId(id);

        contributionRepository.delete(contribution);
    }

    public List<Contribution> findByStatus(String status) {
        return contributionRepository.findByStatus(status);
    }

    public ContributionStatistics getStatistics(Long contributionId) {

        Contribution contribution = findById(contributionId);

        BigDecimal expected =
                memberContributionRepository
                        .getTotalExpectedByContribution(contributionId);

        BigDecimal paid =
                paymentRepository
                        .getTotalPaidByContribution(contributionId);

        BigDecimal remaining = expected.subtract(paid);

        List<MemberContribution> members =
                memberContributionRepository
                        .findByContributionId(contributionId);

        long fullyPaid = 0;
        long partiallyPaid = 0;
        long unpaid = 0;

        for (MemberContribution mc : members) {

            BigDecimal memberPaid =
                    paymentRepository.getTotalPaid(mc.getId());

            if (memberPaid.compareTo(BigDecimal.ZERO) == 0) {

                unpaid++;

            } else if (memberPaid.compareTo(
                    mc.getExpectedAmount()) >= 0) {

                fullyPaid++;

            } else {

                partiallyPaid++;
            }
        }

        return new ContributionStatistics(
                contribution.getId(),
                contribution.getName(),
                expected,
                paid,
                remaining,
                members.size(),
                fullyPaid,
                partiallyPaid,
                unpaid
        );
    }
}