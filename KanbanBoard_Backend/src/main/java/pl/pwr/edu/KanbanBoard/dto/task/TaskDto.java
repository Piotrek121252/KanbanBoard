package pl.pwr.edu.KanbanBoard.dto.task;

import pl.pwr.edu.KanbanBoard.model.TaskPriority;

import java.time.LocalDateTime;

public record TaskDto(
        Integer id,
        Integer position,
        Integer columnId,
        String name,
        String description,
        Boolean isActive,
        LocalDateTime createdDate,
        LocalDateTime dueDate,
        TaskPriority priority,
        Integer assignedUserId,
        String assignedUsername
) {}