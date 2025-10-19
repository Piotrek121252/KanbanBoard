package pl.pwr.edu.KanbanBoard.dto.board;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class BoardDto {
    private Integer id;
    private String name;
    private Boolean isPublic;
    private LocalDateTime createdDate;
    private List<Integer> memberIds;
}
