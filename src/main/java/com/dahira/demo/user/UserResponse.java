package com.dahira.demo.user;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;

    private String username;

    private String email;

    private Role role;

    private Long memberId;

    private String memberName;

    private boolean enabled;
}