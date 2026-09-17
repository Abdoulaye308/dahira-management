package com.dahira.demo.contribution;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contributions")
@RequiredArgsConstructor
public class ContributionController {

    private final ContributionService contributionService;

    @PostMapping
    public ResponseEntity<Contribution> create(
            @Valid @RequestBody Contribution contribution) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(contributionService.create(contribution));
    }

    @GetMapping
    public ResponseEntity<List<Contribution>> findAll() {
        return ResponseEntity.ok(contributionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contribution> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                contributionService.findById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contribution> update(
            @PathVariable Long id,
            @Valid @RequestBody Contribution contribution) {

        return ResponseEntity.ok(
                contributionService.update(id, contribution)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        contributionService.delete(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Contribution>> findByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                contributionService.findByStatus(status)
        );
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<ContributionStatistics> getStatistics(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                contributionService.getStatistics(id)
        );
    }

}