package pl.pwr.edu.KanbanBoard.dto.task;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class TaskDto {
    private Integer id;
    private Integer columnId;
    private String name;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdDate;
    private LocalDateTime dueDate;
}
