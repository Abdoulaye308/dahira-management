package com.dahira.demo.cash;

import com.dahira.demo.expense.Expense;
import com.dahira.demo.expense.ExpenseRepository;
import com.dahira.demo.income.Income;
import com.dahira.demo.income.IncomeRepository;
import com.dahira.demo.payment.Payment;
import com.dahira.demo.payment.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CashService {

    private final PaymentRepository paymentRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    // =========================
    // RÉSUMÉ DE LA CAISSE
    // =========================
    public CashSummaryResponse getSummary() {

        BigDecimal totalPayments =
                paymentRepository.getTotalPaid();

        BigDecimal totalIncomes =
                incomeRepository.getTotalAmount();

        BigDecimal totalExpenses =
                expenseRepository.getTotalAmount();

        BigDecimal totalEntries =
                totalPayments.add(totalIncomes);

        BigDecimal cashBalance =
                totalEntries.subtract(totalExpenses);

        return new CashSummaryResponse(
                totalPayments,
                totalIncomes,
                totalExpenses,
                totalEntries,
                cashBalance
        );
    }

    // =========================
    // JOURNAL DES TRANSACTIONS
    // =========================
    public List<CashTransactionResponse> getTransactions() {

        List<CashTransactionResponse> transactions =
                new ArrayList<>();

        // -------------------------
        // PAIEMENTS DE COTISATIONS
        // -------------------------
        List<Payment> payments =
                paymentRepository.findAll();

        for (Payment payment : payments) {

            String memberName =
                    payment.getMemberContribution()
                            .getMember()
                            .getFirstName()
                            + " "
                            + payment.getMemberContribution()
                            .getMember()
                            .getLastName();

            String contributionName =
                    payment.getMemberContribution()
                            .getContribution()
                            .getName();

            transactions.add(
                    new CashTransactionResponse(
                            payment.getId(),
                            "ENTREE",
                            "Paiement - " + memberName,
                            "Cotisation : " + contributionName,
                            payment.getAmount(),
                            payment.getPaymentDate(),
                            "PAYMENT"
                    )
            );
        }

        // -------------------------
        // AUTRES REVENUS
        // -------------------------
        List<Income> incomes =
                incomeRepository.findAll();

        for (Income income : incomes) {

            transactions.add(
                    new CashTransactionResponse(
                            income.getId(),
                            "ENTREE",
                            income.getTitle(),
                            income.getDescription(),
                            income.getAmount(),
                            income.getIncomeDate(),
                            "INCOME"
                    )
            );
        }

        // -------------------------
        // DÉPENSES
        // -------------------------
        List<Expense> expenses =
                expenseRepository.findAll();

        for (Expense expense : expenses) {

            transactions.add(
                    new CashTransactionResponse(
                            expense.getId(),
                            "SORTIE",
                            expense.getTitle(),
                            expense.getDescription(),
                            expense.getAmount(),
                            expense.getExpenseDate(),
                            "EXPENSE"
                    )
            );
        }

        // -------------------------
        // TRI PAR DATE
        // PLUS RÉCENT EN PREMIER
        // -------------------------
        transactions.sort(
                Comparator.comparing(
                        CashTransactionResponse::getDate,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        return transactions;
    }
}