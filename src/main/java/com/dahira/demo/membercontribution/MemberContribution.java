package com.dahira.demo.membercontribution;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.dahira.demo.contribution.Contribution;
import com.dahira.demo.member.Member;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "member_contributions",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"member_id", "contribution_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberContribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Le membre est obligatoire.")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;


    @NotNull(message = "La contribution est obligatoire.")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contribution_id", nullable = false)
    private Contribution contribution;

    @NotNull(message = "Le montant prévu est obligatoire.")
    @Positive(message = "Le montant prévu doit être supérieur à zéro.")
    @Column(
            name = "expected_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal expectedAmount;

}