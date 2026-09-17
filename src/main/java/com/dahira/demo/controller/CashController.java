package com.dahira.demo.cash;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cash")
@RequiredArgsConstructor
public class CashController {

    private final CashService cashService;

    @GetMapping("/summary")
    public ResponseEntity<CashSummaryResponse> getSummary() {

        return ResponseEntity.ok(
                cashService.getSummary()
        );
    }
    // JOURNAL DES TRANSACTIONS
    @GetMapping("/transactions")
    public ResponseEntity<List<CashTransactionResponse>> getTransactions() {

        return ResponseEntity.ok(
                cashService.getTransactions()
        );
    }
}