package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pl.pwr.edu.KanbanBoard.dto.UserDto;
import pl.pwr.edu.KanbanBoard.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(
            @RequestParam(required = false) Integer excludeBoardId, // Opcjonalny parametr pozwalający wyświetlić użytkowników z pominięciem członków z danej tablicy
            @RequestParam(required = false) String search // Search query
    ) {
        return ResponseEntity.ok(userService.getAllUsers(excludeBoardId, search));
    }
}
