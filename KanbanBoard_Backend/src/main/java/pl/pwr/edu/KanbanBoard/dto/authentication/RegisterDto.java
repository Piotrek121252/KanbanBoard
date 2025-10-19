package pl.pwr.edu.KanbanBoard.dto.authentication;


public record RegisterDto(
        String username,
        String email,
        String password,
        String confirmPassword
) {}
