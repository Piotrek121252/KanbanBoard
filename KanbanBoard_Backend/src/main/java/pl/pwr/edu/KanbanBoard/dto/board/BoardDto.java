package pl.pwr.edu.KanbanBoard.dto.board;

import java.time.LocalDateTime;
import java.util.List;

public record BoardDto(
        Integer id,
        String name,
        Boolean isPublic,
        LocalDateTime createdDate,
        List<Integer> memberIds,
        Boolean isFavorite
) {}

