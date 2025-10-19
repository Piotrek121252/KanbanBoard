package pl.pwr.edu.KanbanBoard.dto.authentication;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String username,
        String email,
        LocalDateTime signUpDate
) {}
