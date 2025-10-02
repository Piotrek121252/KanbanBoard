package pl.pwr.edu.KanbanBoard.dto;

import lombok.Data;

import java.util.List;

@Data
public class ColumnDto {
    private Long id;
    private String name;
    private int position;
    private List<TaskDto> tasks;
}
