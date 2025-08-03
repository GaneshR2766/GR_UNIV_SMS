package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.payload.LoginRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCrypt;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD_HASH = BCrypt.hashpw("securePassword123!", BCrypt.gensalt(12));
    
    private final Map<String, Integer> failedAttempts = new ConcurrentHashMap<>();
    private final Map<String, Long> lockedAccounts = new ConcurrentHashMap<>();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // For IP tracking in Spring Boot, you'll need to inject HttpServletRequest
        // or implement a different approach. This simplified version removes IP tracking.
        
        // Input validation
        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null ||
            loginRequest.getUsername().isEmpty() || loginRequest.getPassword().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "status", "error",
                        "message", "Username and password are required"
                    ));
        }

        if (loginRequest.getPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "status", "error",
                        "message", "Password must be at least 8 characters"
                    ));
        }

        if (ADMIN_USERNAME.equals(loginRequest.getUsername())) {
            if (BCrypt.checkpw(loginRequest.getPassword(), ADMIN_PASSWORD_HASH)) {
                return ResponseEntity.ok(Map.of("status", "success"));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "status", "error",
                    "message", "Invalid credentials"
                ));
    }
}