package com.dahira.demo.expense;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    // CREATE
    public Expense create(Expense expense) {
        return expenseRepository.save(expense);
    }

    // READ ALL
    public List<Expense> findAll() {
        return expenseRepository.findAllByOrderByExpenseDateDesc();
    }

    // READ ONE
    public Expense findById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Dépense introuvable."
                        )
                );
    }

    // UPDATE
    public Expense update(Long id, Expense expense) {

        Expense existing = findById(id);

        existing.setTitle(expense.getTitle());
        existing.setDescription(expense.getDescription());
        existing.setAmount(expense.getAmount());
        existing.setExpenseDate(expense.getExpenseDate());

        return expenseRepository.save(existing);
    }

    // DELETE DÉFINITIF
    public void delete(Long id) {

        Expense expense = findById(id);

        expenseRepository.delete(expense);
    }

    // TOTAL DES DÉPENSES
    public BigDecimal getTotalAmount() {
        return expenseRepository.getTotalAmount();
    }
}