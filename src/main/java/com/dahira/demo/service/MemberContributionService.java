package com.dahira.demo.membercontribution;

import com.dahira.demo.contribution.ContributionRepository;
import com.dahira.demo.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberContributionService {

    private final MemberContributionRepository repository;
    private final MemberRepository memberRepository;
    private final ContributionRepository contributionRepository;

    public MemberContribution create(MemberContributionRequest request) {

        Long memberId = request.getMemberId();
        Long contributionId = request.getContributionId();

        if (repository.existsByMemberIdAndContributionId(
                memberId,
                contributionId)) {

            throw new RuntimeException(
                    "Ce membre est déjà associé à cette contribution."
            );
        }

        var member = memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Membre introuvable."
                        ));

        var contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Contribution introuvable."
                        ));

        MemberContribution memberContribution =
                MemberContribution.builder()
                        .member(member)
                        .contribution(contribution)
                        .expectedAmount(request.getExpectedAmount())
                        .build();

        return repository.save(memberContribution);
    }

    public List<MemberContribution> findAll() {
        return repository.findAll();
    }

    public MemberContribution findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Association introuvable."
                        ));
    }

    public MemberContribution update(
            Long id,
            MemberContributionUpdateRequest request) {

        MemberContribution existing = findById(id);

        existing.setExpectedAmount(
                request.getExpectedAmount()
        );

        return repository.save(existing);
    }

    public void delete(Long id) {
        MemberContribution existing = findById(id);
        repository.delete(existing);
    }

    public List<MemberContribution> findByContribution(
            Long contributionId) {

        return repository.findByContributionId(contributionId);
    }

    public List<MemberContribution> findByMember(Long memberId) {

        return repository.findByMemberId(memberId);
    }
}