package pl.pwr.edu.KanbanBoard.dto.task;

import java.time.LocalDateTime;

public record TaskDto(
        Integer id,
        Integer columnId,
        String name,
        String description,
        Boolean isActive,
        LocalDateTime createdDate,
        LocalDateTime dueDate
) {}