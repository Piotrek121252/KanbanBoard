package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.authentication.AuthResponseDto;
import pl.pwr.edu.KanbanBoard.dto.authentication.LoginRequestDto;
import pl.pwr.edu.KanbanBoard.dto.authentication.RegisterRequestDto;
import pl.pwr.edu.KanbanBoard.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {


    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequestDto loginRequestDto) {
        return ResponseEntity.ok(userService.login(loginRequestDto));
    }
    @PostMapping("register")
    public ResponseEntity<String> register(@RequestBody RegisterRequestDto registerRequestDto) {
        return ResponseEntity.ok(userService.register(registerRequestDto));
    }
}
