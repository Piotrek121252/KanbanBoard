package pl.pwr.edu.KanbanBoard.dto.authentication;


public record LoginRequestDto(
        String username,
        String password
) {}
