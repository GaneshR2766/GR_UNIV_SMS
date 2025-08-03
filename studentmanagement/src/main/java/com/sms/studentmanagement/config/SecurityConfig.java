package com.sms.studentmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/**").permitAll() // ✅ allow all endpoints
            )
            .headers(headers -> headers
    .frameOptions(frameOptions -> frameOptions
        .sameOrigin()  // or .deny()
    )
)
            .formLogin(login -> login.disable());

        return http.build();
    }
}
