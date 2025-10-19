package pl.pwr.edu.KanbanBoard.dto.comment;

import java.time.LocalDateTime;

public record CommentDto(
        Integer id,
        String comment,
        String username,
        LocalDateTime createdDate
) {}
