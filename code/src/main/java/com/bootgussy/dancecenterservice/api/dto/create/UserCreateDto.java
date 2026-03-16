package com.bootgussy.dancecenterservice.api.dto.create;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserCreateDto {
    private String username;
    private String password;
    private String phoneNumber;
    private List<Long> rolesId;
}
