package com.dahira.demo.controller;
import com.dahira.demo.auth.MemberRegisterRequest;
import com.dahira.demo.auth.AuthResponse;
import com.dahira.demo.service.AuthService;
import com.dahira.demo.auth.LoginRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                authService.login(request)
        );
    }
    @PostMapping("/register-member")
    public ResponseEntity<AuthResponse> registerMember(
            @Valid @RequestBody MemberRegisterRequest request
    ) {
        return ResponseEntity.ok(
                authService.registerMember(request)
        );
    }
}