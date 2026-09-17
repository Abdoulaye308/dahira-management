package com.dahira.demo.service;
import com.dahira.demo.service.JwtService;        // selon l'emplacement réel
import com.dahira.demo.auth.LoginRequest;           // selon l'emplacement réel
import com.dahira.demo.auth.AuthResponse;           // selon l'emplacement réel
import com.dahira.demo.user.User;
import com.dahira.demo.user.UserRepository;
import com.dahira.demo.auth.MemberRegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.dahira.demo.member.Member;
import com.dahira.demo.member.MemberRepository;
import com.dahira.demo.user.Role;
import com.dahira.demo.user.User;
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MemberRepository memberRepository;
    public AuthResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Email ou mot de passe incorrect."
                        )
                );

        if (!user.isEnabled()) {
            throw new RuntimeException(
                    "Ce compte est désactivé."
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Email ou mot de passe incorrect."
            );
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }
    public AuthResponse registerMember(MemberRegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException(
                    "Ce nom d'utilisateur existe déjà."
            );
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Cette adresse email existe déjà."
            );
        }

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new RuntimeException(
                        "Membre introuvable."
                ));

        if (userRepository.existsByMemberId(member.getId())) {
            throw new RuntimeException(
                    "Ce membre possède déjà un compte."
            );
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.MEMBER)
                .member(member)
                .enabled(true)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
