package com.dahira.demo.member;

import com.dahira.demo.category.Category;
import com.dahira.demo.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;

    public Member create(MemberRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable."));

        Member member = new Member();

        member.setFirstName(request.getFirstName());
        member.setLastName(request.getLastName());
        member.setPhone(request.getPhone());
        member.setGender(request.getGender());
        member.setCategory(category);

        if (request.getJoinDate() != null) {
            member.setJoinDate(request.getJoinDate());
        }

        if (request.getStatus() != null) {
            member.setStatus(request.getStatus());
        }

        return memberRepository.save(member);
    }

    public List<Member> findAll() {
        return memberRepository.findAll();
    }

    public Member findById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membre introuvable."));
    }

    public Member update(Long id, MemberRequest request) {

        Member existing = findById(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable."));

        existing.setFirstName(request.getFirstName());
        existing.setLastName(request.getLastName());
        existing.setPhone(request.getPhone());
        existing.setGender(request.getGender());
        existing.setCategory(category);

        if (request.getJoinDate() != null) {
            existing.setJoinDate(request.getJoinDate());
        }

        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }

        return memberRepository.save(existing);
    }
    public void delete(Long id) {
        if (!memberRepository.existsById(id)) {
            throw new RuntimeException("Membre introuvable.");
        }

        memberRepository.deleteById(id);
    }

    public List<Member> search(String keyword) {
        return memberRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        keyword,
                        keyword
                );
    }

    public List<Member> findByStatus(String status) {
        return memberRepository.findByStatus(status);
    }
}