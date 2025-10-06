package pl.pwr.edu.KanbanBoard.dto.Task;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CreateTaskDto {
    private String name;
    private String description;
    private LocalDateTime dueDate;
}
