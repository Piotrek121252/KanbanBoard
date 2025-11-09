package pl.pwr.edu.KanbanBoard.dto.task;

import pl.pwr.edu.KanbanBoard.dto.UserDto;
import pl.pwr.edu.KanbanBoard.model.TaskPriority;

import java.time.LocalDateTime;

public record CreateTaskRequest(
        String name,
        String description,
        Boolean isActive,
        LocalDateTime dueDate,
        Integer position,
        TaskPriority priority
) {}
