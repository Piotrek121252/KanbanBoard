package pl.pwr.edu.KanbanBoard.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.config.JWTGenerator;
import pl.pwr.edu.KanbanBoard.dto.authentication.AuthResponseDto;
import pl.pwr.edu.KanbanBoard.dto.authentication.LoginRequestDto;
import pl.pwr.edu.KanbanBoard.dto.authentication.RegisterRequestDto;
import pl.pwr.edu.KanbanBoard.model.Role;
import pl.pwr.edu.KanbanBoard.model.UserEntity;
import pl.pwr.edu.KanbanBoard.repository.RoleRepository;
import pl.pwr.edu.KanbanBoard.repository.UserRepository;

import java.util.Collections;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTGenerator jwtGenerator;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JWTGenerator jwtGenerator) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtGenerator = jwtGenerator;
    }

    public AuthResponseDto login(LoginRequestDto loginRequestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.username(), loginRequestDto.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtGenerator.generateToken(authentication);

        return new AuthResponseDto(token, "Bearer");
    }

    public String register(RegisterRequestDto request) {
        validateRegisterData(request);

        UserEntity user = new UserEntity();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Nie znaleziono domyślnej roli USER"));
        user.setRoles(Collections.singletonList(role));

        userRepository.save(user);
        return "Użytkownik został utworzony.";
    }

    public UserEntity getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika: " + username));
    }

    private void validateRegisterData(RegisterRequestDto request) {
        // Walidacja username
        String username = request.username();
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Nazwa użytkownika nie może być pusta.");
        } else if (username.length() < 3 || username.length() > 20) {
            throw new IllegalArgumentException("Nazwa użytkownika musi mieć od 3 do 20 znaków.");
        } else if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Nazwa użytkownika jest już zajęta.");
        }
        // Walidacja adresu email
        String email = request.email();
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Adres e-mail nie może być pusty.");
        } else if (email.length() > 40) {
            throw new IllegalArgumentException("Adres e-mail nie może przekraczć 40 znaków.");
        } else if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new IllegalArgumentException("Adres e-mail ma niepoprawny format.");
        } else if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Adres e-mail jest już wykorzystany przez innego użytkownika.");
        }
        // Walidacja hasła
        String password = request.password();
        String confirmPassword = request.confirmPassword();
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Hasło nie może być puste.");
        } else if (password.length() < 8 || password.length() > 64) {
            throw new IllegalArgumentException("Hasło musi zawierać od 8 do 64 znaków.");
        } else if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Hasła nie są zgodne!");
        }
    }
}
