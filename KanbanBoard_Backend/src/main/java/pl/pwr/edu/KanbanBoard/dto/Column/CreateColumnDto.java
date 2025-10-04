package pl.pwr.edu.KanbanBoard.dto.Column;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreateColumnDto {
    private String name;
    private Integer position;
}
