package com.dahira.demo.income;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    // CREATE
    @PostMapping
    public ResponseEntity<Income> create(
            @Valid @RequestBody Income income) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(incomeService.create(income));
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<Income>> findAll() {

        return ResponseEntity.ok(
                incomeService.findAll()
        );
    }

    // TOTAL
    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getTotalAmount() {

        return ResponseEntity.ok(
                incomeService.getTotalAmount()
        );
    }

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Income> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                incomeService.findById(id)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Income> update(
            @PathVariable Long id,
            @Valid @RequestBody Income income) {

        return ResponseEntity.ok(
                incomeService.update(id, income)
        );
    }

    // DELETE DÉFINITIF
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        incomeService.delete(id);

        return ResponseEntity.noContent().build();
    }
}