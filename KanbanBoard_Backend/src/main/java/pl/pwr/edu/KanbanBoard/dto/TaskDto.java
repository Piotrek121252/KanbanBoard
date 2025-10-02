package pl.pwr.edu.KanbanBoard.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private int priority;
    private Long assignedToId;
}
