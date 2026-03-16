package com.bootgussy.dancecenterservice.core.service;

import com.bootgussy.dancecenterservice.api.dto.create.LoginRequest;
import com.bootgussy.dancecenterservice.api.dto.create.RegisterRequest;
import com.bootgussy.dancecenterservice.api.dto.response.JwtResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseCookie;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    ResponseCookie generateRefreshCookie(Long id);
    JwtResponse registerUser(@Valid RegisterRequest signUpRequest);
}
