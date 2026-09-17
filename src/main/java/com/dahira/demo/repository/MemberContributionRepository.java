package com.dahira.demo.membercontribution;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MemberContributionRepository
        extends JpaRepository<MemberContribution, Long> {

    List<MemberContribution> findByContributionId(Long contributionId);

    List<MemberContribution> findByMemberId(Long memberId);

    boolean existsByMemberIdAndContributionId(
            Long memberId,
            Long contributionId
    );
    void deleteByContributionId(Long contributionId);
    @Query("""
    SELECT COALESCE(SUM(mc.expectedAmount), 0)
    FROM MemberContribution mc
    WHERE mc.contribution.id = :contributionId
""")
    BigDecimal getTotalExpectedByContribution(
            @Param("contributionId") Long contributionId
    );
    @Query("""
    SELECT COALESCE(SUM(mc.expectedAmount), 0)
    FROM MemberContribution mc
""")
    BigDecimal getTotalExpected();
}