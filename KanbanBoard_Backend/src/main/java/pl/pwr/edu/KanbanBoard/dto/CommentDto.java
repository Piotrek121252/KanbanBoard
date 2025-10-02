package pl.pwr.edu.KanbanBoard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CommentDto {
    private Integer id;
    private Integer userId;
    private Integer taskId;
    private String comment;
    private LocalDateTime createdDate;
}
