package pl.pwr.edu.KanbanBoard.dto.authentication;

import lombok.Getter;
import lombok.Setter;

public record AuthResponseDto(
        String accessToken,
        String tokenType
) {}
