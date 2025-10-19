package pl.pwr.edu.KanbanBoard.dto.board;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreateBoardDto {
    private String name;
    private Boolean isPublic;
}
