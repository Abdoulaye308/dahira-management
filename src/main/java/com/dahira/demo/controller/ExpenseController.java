package com.dahira.demo.expense;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // CREATE
    @PostMapping
    public ResponseEntity<Expense> create(
            @Valid @RequestBody Expense expense) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(expenseService.create(expense));
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<Expense>> findAll() {

        return ResponseEntity.ok(
                expenseService.findAll()
        );
    }

    // TOTAL
    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getTotalAmount() {

        return ResponseEntity.ok(
                expenseService.getTotalAmount()
        );
    }

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Expense> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                expenseService.findById(id)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(
            @PathVariable Long id,
            @Valid @RequestBody Expense expense) {

        return ResponseEntity.ok(
                expenseService.update(id, expense)
        );
    }

    // DELETE DÉFINITIF
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        expenseService.delete(id);

        return ResponseEntity.noContent().build();
    }
}