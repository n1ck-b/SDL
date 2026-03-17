package com.bootgussy.dancecenterservice.api.controller;

import com.bootgussy.dancecenterservice.api.dto.create.LoginRequest;
import com.bootgussy.dancecenterservice.api.dto.create.RegisterRequest;
import com.bootgussy.dancecenterservice.api.dto.response.JwtResponse;
import com.bootgussy.dancecenterservice.core.service.AuthService;
import com.bootgussy.dancecenterservice.core.service.TokenService;
import com.bootgussy.dancecenterservice.core.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final TokenService tokenService;
    private final UserService userService;

    @Autowired
    public AuthController(AuthService authService,
                          TokenService tokenService,
                          UserService userService){
        this.authService = authService;
        this.tokenService = tokenService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);

        ResponseCookie cookie = authService.generateRefreshCookie(userService.findByPhoneNumber(loginRequest.getPhoneNumber()).getId());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(jwtResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refresh(@CookieValue(name = "refreshToken") String refreshToken) {
        JwtResponse response = tokenService.refreshAccessToken(refreshToken);

        ResponseCookie newCookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newCookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        tokenService.deleteToken(refreshToken);
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .maxAge(0)
                .path("/api/auth")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logged out successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerUser(request));
    }
}
