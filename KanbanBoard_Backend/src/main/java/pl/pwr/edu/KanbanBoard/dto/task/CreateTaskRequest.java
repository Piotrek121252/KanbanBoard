package pl.pwr.edu.KanbanBoard.dto.task;

import java.time.LocalDateTime;

public record CreateTaskRequest(
        String name,
        String description,
        LocalDateTime dueDate
) {}
