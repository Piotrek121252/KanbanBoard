package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.config.JWTGenerator;
import pl.pwr.edu.KanbanBoard.dto.authentication.AuthResponseDto;
import pl.pwr.edu.KanbanBoard.dto.authentication.LoginDto;
import pl.pwr.edu.KanbanBoard.dto.authentication.RegisterDto;
import pl.pwr.edu.KanbanBoard.model.Role;
import pl.pwr.edu.KanbanBoard.model.UserEntity;
import pl.pwr.edu.KanbanBoard.repository.RoleRepository;
import pl.pwr.edu.KanbanBoard.repository.UserRepository;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTGenerator jwtGenerator;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          RoleRepository roleRepository, PasswordEncoder passwordEncoder, JWTGenerator jwtGenerator) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtGenerator = jwtGenerator;
    }

    @PostMapping("login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginDto loginDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.username(), loginDto.password()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtGenerator.generateToken(authentication);

            return ResponseEntity.ok(new AuthResponseDto(token, "Bearer"));
        } catch (BadCredentialsException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDto("Nieprawidłowa nazwa użytkownika lub hasło"));
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDto("Wystąpił błąd podczas logowania"));
        }
    }

    @PostMapping("register")
    public ResponseEntity<String> register(@RequestBody RegisterDto registerDto) {

        // Walidacja username
        String username = registerDto.username();
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username cannot be empty.");
        } else if (username.length() < 3 || username.length() > 20) {
            return ResponseEntity.badRequest().body("Username must be between 3 and 20 characters.");
        }else if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Username is already taken.");
        }

        // Walidacja adresu e-mail
        String email = registerDto.email();
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email cannot be empty.");
        }
        if (email.length() > 40) {
            return ResponseEntity.badRequest().body("Email must be less than 40 characters.");
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            return ResponseEntity.badRequest().body("Invalid email format.");
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email is already registered.");
        }

        // Walidacja hasła
        String password = registerDto.password();
        String confirmPassword = registerDto.confirmPassword();
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body("Password cannot be empty.");
        } else if (password.length() < 8 || password.length() > 64) {
            return ResponseEntity.badRequest().body("Password must be between 8 and 64 characters.");
        } else if (!password.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body("Passwords do not match.");
        }

        // Tworzenie i zapisanie użytkownika
        UserEntity user = new UserEntity();
        user.setUsername(registerDto.username());
        user.setEmail(registerDto.email());
        user.setPassword(passwordEncoder.encode(password));

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Default role USER not found"));
        user.setRoles(Collections.singletonList(role));

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully.");
    }
}
