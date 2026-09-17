package com.dahira.demo.payment;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> create(
            @Valid @RequestBody Payment payment) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paymentService.create(payment));
    }



    @GetMapping
    public ResponseEntity<List<Payment>> findAll() {
        return ResponseEntity.ok(paymentService.findAll());
    }
    @GetMapping("/summary")
    public ResponseEntity<List<PaymentSummaryResponse>> getPaymentSummary() {
        return ResponseEntity.ok(
                paymentService.getPaymentSummary()
        );
    }
    @GetMapping("/{id}")
    public ResponseEntity<Payment> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.findById(id)
        );
    }

    @GetMapping("/member-contribution/{id}")
    public ResponseEntity<List<Payment>> findByMemberContribution(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.findByMemberContribution(id)
        );
    }

    @GetMapping("/member-contribution/{id}/total")
    public ResponseEntity<BigDecimal> getTotalPaid(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.getTotalPaid(id)
        );
    }

    @GetMapping("/member-contribution/{id}/remaining")
    public ResponseEntity<BigDecimal> getRemainingAmount(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.getRemainingAmount(id)
        );
    }
    @PutMapping("/{id}")
    public ResponseEntity<Payment> update(
            @PathVariable Long id,
            @Valid @RequestBody PaymentUpdateRequest request) {

        return ResponseEntity.ok(
                paymentService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        paymentService.delete(id);

        return ResponseEntity.noContent().build();
    }

}