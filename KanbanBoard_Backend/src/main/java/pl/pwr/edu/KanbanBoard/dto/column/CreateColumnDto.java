package pl.pwr.edu.KanbanBoard.dto.column;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreateColumnDto {
    private String name;
    private Integer position;
}
