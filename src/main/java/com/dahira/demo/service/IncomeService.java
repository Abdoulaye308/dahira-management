package com.dahira.demo.income;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;

    // CREATE
    public Income create(Income income) {
        return incomeRepository.save(income);
    }

    // READ ALL
    public List<Income> findAll() {
        return incomeRepository.findAllByOrderByIncomeDateDesc();
    }

    // READ ONE
    public Income findById(Long id) {
        return incomeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Revenu introuvable.")
                );
    }

    // UPDATE
    public Income update(Long id, Income income) {

        Income existing = findById(id);

        existing.setTitle(income.getTitle());
        existing.setDescription(income.getDescription());
        existing.setAmount(income.getAmount());
        existing.setIncomeDate(income.getIncomeDate());

        return incomeRepository.save(existing);
    }

    // DELETE DÉFINITIF
    public void delete(Long id) {

        Income income = findById(id);

        incomeRepository.delete(income);
    }

    // TOTAL DES REVENUS
    public BigDecimal getTotalAmount() {
        return incomeRepository.getTotalAmount();
    }
}