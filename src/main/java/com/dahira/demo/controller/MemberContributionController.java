package com.dahira.demo.membercontribution;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member-contributions")
@RequiredArgsConstructor
public class MemberContributionController {

    private final MemberContributionService service;

    @PostMapping
    public ResponseEntity<MemberContribution> create(
            @Valid @RequestBody MemberContributionRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<MemberContribution>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberContribution> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberContribution> update(
            @PathVariable Long id,
            @Valid @RequestBody MemberContributionUpdateRequest request) {

        return ResponseEntity.ok(
                service.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contribution/{contributionId}")
    public ResponseEntity<List<MemberContribution>> findByContribution(
            @PathVariable Long contributionId) {

        return ResponseEntity.ok(
                service.findByContribution(contributionId)
        );
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<MemberContribution>> findByMember(
            @PathVariable Long memberId) {

        return ResponseEntity.ok(
                service.findByMember(memberId)
        );
    }
}