package pl.pwr.edu.KanbanBoard.dto.Comment;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CommentDto {
    private Integer id;
    private String comment;
    private String username;
    private LocalDateTime createdDate;
}
