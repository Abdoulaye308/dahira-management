package com.dahira.demo.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberProfileResponse {

    private Long userId;
    private Long memberId;

    private String username;
    private String email;

    private String firstName;
    private String lastName;
    private String phone;
    private String gender;
    private String status;
}