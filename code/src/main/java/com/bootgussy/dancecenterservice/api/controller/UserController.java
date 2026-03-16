package com.bootgussy.dancecenterservice.api.controller;

import com.bootgussy.dancecenterservice.api.dto.create.UserCreateDto;
import com.bootgussy.dancecenterservice.api.dto.response.UserResponseDto;
import com.bootgussy.dancecenterservice.core.mapper.UserMapper;
import com.bootgussy.dancecenterservice.core.model.User;
import com.bootgussy.dancecenterservice.core.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User", description = "API for managing users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;

    @Operation(summary = "Get user by ID", description = "Retrieves a user by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> findGroupById(
            @Parameter(description = "User's ID", example = "1") @PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(userMapper.toResponseDto(user));
    }

    @Operation(summary = "Get all users", description = "Retrieves all users")
    @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    @GetMapping
    public ResponseEntity<List<UserResponseDto>> findAllGroups() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(userMapper.toResponseDtoList(users));
    }

    @Operation(summary = "Get user by phone number", description = "Retrieves a user by its phone number")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/phone/{phoneNumber}")
    public ResponseEntity<UserResponseDto> getUserByPhoneNumber(
            @Parameter(description = "User's phone number", example = "+375295174041") @PathVariable String phoneNumber) {
        User user = userService.findByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(userMapper.toResponseDto(user));
    }

    @Operation(summary = "Create a new user", description = "Creates a new user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "409", description = "This user already exists")
    })
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDto> createUser(
            @Parameter(description = "Data to create the user")
            @Valid @RequestBody UserCreateDto createDto) {
        User user = userMapper.toEntity(createDto);
        User createdUser = userService.createUser(user);
        return new ResponseEntity<>(userMapper.toResponseDto(createdUser), HttpStatus.CREATED);
    }

    @Operation(summary = "Update user by ID", description = "Updates an existing user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "User not found"),
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserResponseDto> updateUser(
            @Parameter(description = "User's ID", example = "1") @PathVariable Long id,
            @Parameter(description = "Data to update the user")
            @Valid @RequestBody UserCreateDto createDto) {
        User user = userMapper.toEntity(createDto);
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(userMapper.toResponseDto(updatedUser));
    }

    @Operation(summary = "Delete user by ID", description = "Deletes an existing user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteGroup(
            @Parameter(description = "User's ID", example = "1") @PathVariable Long id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
