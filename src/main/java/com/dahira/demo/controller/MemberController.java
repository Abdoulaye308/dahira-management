package com.dahira.demo.member;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping
    public ResponseEntity<Member> create(
            @Valid @RequestBody MemberRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(memberService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<Member>> findAll() {
        return ResponseEntity.ok(memberService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> findById(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> update(
            @PathVariable Long id,
            @Valid @RequestBody MemberRequest request) {

        return ResponseEntity.ok(
                memberService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        memberService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Member>> search(
            @RequestParam String keyword) {

        return ResponseEntity.ok(memberService.search(keyword));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Member>> findByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(memberService.findByStatus(status));
    }

}