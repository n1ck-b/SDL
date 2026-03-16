package com.bootgussy.dancecenterservice.core.mapper;

import com.bootgussy.dancecenterservice.api.dto.create.StudentCreateDto;
import com.bootgussy.dancecenterservice.api.dto.response.StudentResponseDto;
import com.bootgussy.dancecenterservice.core.model.Student;
import com.bootgussy.dancecenterservice.core.repository.GroupRepository;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class StudentMapper {
    @Autowired
    protected GroupRepository groupRepository;

    @Mapping(target = "user.name", source = "name")
    @Mapping(target = "user.phoneNumber", source = "phoneNumber")
    @Mapping(target = "user.password", source = "password")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "groups", ignore = true)
    public abstract Student toEntity(StudentCreateDto studentCreateDto);

    @Mapping(target = "name", source = "user.name")
    @Mapping(target = "phoneNumber", source = "user.phoneNumber")
    @Mapping(target = "groupsId", expression = "java(student.getGroups() != null ? " +
            "student.getGroups().stream().map(g -> g.getId()).toList() : new java.util.ArrayList<>())")
    public abstract StudentResponseDto toResponseDto(Student student);

    public abstract List<StudentResponseDto> toResponseDtoList(List<Student> students);
}
