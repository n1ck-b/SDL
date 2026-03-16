package com.bootgussy.dancecenterservice.core.mapper;

import com.bootgussy.dancecenterservice.api.dto.create.UserCreateDto;
import com.bootgussy.dancecenterservice.api.dto.response.UserResponseDto;
import com.bootgussy.dancecenterservice.core.model.Role;
import com.bootgussy.dancecenterservice.core.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class UserMapper {
    @Mapping(target = "rolesId", source = "roles", qualifiedByName = "mapRolesToIds")
    public abstract UserResponseDto toResponseDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "name", source = "username")
    public abstract User toEntity(UserCreateDto createDto);

    public abstract List<UserResponseDto> toResponseDtoList(List<User> users);

    @Named("mapRolesToIds")
    protected List<Long> mapRolesToIds(List<Role> roles) {
        if (roles == null) return null;
        return roles.stream()
                .map(Role::getId)
                .collect(Collectors.toList());
    }
}
