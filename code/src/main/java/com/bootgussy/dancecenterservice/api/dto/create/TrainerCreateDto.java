package com.bootgussy.dancecenterservice.api.dto.create;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TrainerCreateDto {
    private String name;
    private String phoneNumber;
    private String password;
    private String danceStyle;
}
