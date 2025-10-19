package pl.pwr.edu.KanbanBoard.dto.column;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ColumnDto {
    private Integer id;
    private Integer boardId;
    private String name;
    private Integer position;
}
