package com.dahira.demo.payment;

import com.dahira.demo.membercontribution.MemberContribution;
import com.dahira.demo.membercontribution.MemberContributionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberContributionRepository memberContributionRepository;

    public Payment create(Payment payment) {

        Long memberContributionId =
                payment.getMemberContribution().getId();

        MemberContribution memberContribution =
                memberContributionRepository
                        .findById(memberContributionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Association membre/contribution introuvable."
                                ));

        if (payment.getAmount() == null ||
                payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Le montant du paiement doit être supérieur à zéro."
            );
        }

        BigDecimal totalPaid =
                paymentRepository.getTotalPaid(memberContributionId);

        BigDecimal newTotal =
                totalPaid.add(payment.getAmount());

        if (newTotal.compareTo(
                memberContribution.getExpectedAmount()) > 0) {

            throw new RuntimeException(
                    "Le paiement dépasse le montant prévu."
            );
        }

        payment.setMemberContribution(memberContribution);

        return paymentRepository.save(payment);
    }

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Paiement introuvable."
                        ));
    }

    public List<Payment> findByMemberContribution(
            Long memberContributionId) {

        return paymentRepository
                .findByMemberContributionId(memberContributionId);
    }

    public BigDecimal getTotalPaid(Long memberContributionId) {
        return paymentRepository.getTotalPaid(memberContributionId);
    }

    public BigDecimal getRemainingAmount(
            Long memberContributionId) {

        MemberContribution memberContribution =
                memberContributionRepository
                        .findById(memberContributionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Association introuvable."
                                ));

        BigDecimal totalPaid =
                paymentRepository.getTotalPaid(memberContributionId);

        return memberContribution
                .getExpectedAmount()
                .subtract(totalPaid);
    }

    public void delete(Long id) {
        Payment payment = findById(id);
        paymentRepository.delete(payment);
    }
    public Payment update(Long id, PaymentUpdateRequest request) {

        // Récupérer le paiement existant
        Payment existing = findById(id);

        // Récupérer l'association membre/cotisation
        MemberContribution memberContribution =
                existing.getMemberContribution();

        // Total déjà payé pour cette cotisation
        BigDecimal totalPaid =
                paymentRepository.getTotalPaid(
                        memberContribution.getId()
                );

        // Retirer l'ancien montant du calcul
        BigDecimal totalWithoutCurrentPayment =
                totalPaid.subtract(existing.getAmount());

        // Calculer le nouveau total
        BigDecimal newTotal =
                totalWithoutCurrentPayment.add(request.getAmount());

        // Vérifier qu'on ne dépasse pas le montant attendu
        if (newTotal.compareTo(
                memberContribution.getExpectedAmount()
        ) > 0) {

            throw new RuntimeException(
                    "La modification dépasse le montant prévu."
            );
        }

        // Mettre à jour le paiement
        existing.setAmount(request.getAmount());
        existing.setPaymentDate(request.getPaymentDate());

        return paymentRepository.save(existing);
    }
    public List<PaymentSummaryResponse> getPaymentSummary() {
        return paymentRepository.getPaymentSummary();
    }
}