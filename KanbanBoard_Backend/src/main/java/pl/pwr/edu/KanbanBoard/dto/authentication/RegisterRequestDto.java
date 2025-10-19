package pl.pwr.edu.KanbanBoard.dto.authentication;


public record RegisterRequestDto(
        String username,
        String email,
        String password,
        String confirmPassword
) {}
