package com.bootgussy.dancecenterservice.core.mapper;

import com.bootgussy.dancecenterservice.api.dto.create.TrainerCreateDto;
import com.bootgussy.dancecenterservice.api.dto.response.TrainerResponseDto;
import com.bootgussy.dancecenterservice.core.model.Trainer;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public abstract class TrainerMapper {
    @Mapping(target = "user.name", source = "name")
    @Mapping(target = "user.phoneNumber", source = "phoneNumber")
    @Mapping(target = "user.password", source = "password")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "groups", ignore = true)
    public abstract Trainer toEntity(TrainerCreateDto trainerCreateDto);

    @Mapping(target = "name", source = "user.name")
    @Mapping(target = "phoneNumber", source = "user.phoneNumber")
    @Mapping(target = "groupsId", expression = "java(trainer.getGroups() != null ? " +
            "trainer.getGroups().stream().map(g -> g.getId()).toList() : new ArrayList<>())")
    public abstract TrainerResponseDto toResponseDto(Trainer trainer);

    public abstract List<TrainerResponseDto> toResponseDtoList(List<Trainer> trainers);
}
