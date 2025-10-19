package pl.pwr.edu.KanbanBoard.dto.task;

import java.time.LocalDateTime;

public record CreateTaskDto(
        String name,
        String description,
        LocalDateTime dueDate
) {}
