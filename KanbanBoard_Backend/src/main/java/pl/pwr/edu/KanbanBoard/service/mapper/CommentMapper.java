package pl.pwr.edu.KanbanBoard.service.mapper;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.comment.CommentDto;
import pl.pwr.edu.KanbanBoard.model.Comment;

import java.util.function.Function;

@Service
public class CommentMapper implements Function<Comment, CommentDto> {


    @Override
    public CommentDto apply(Comment comment) {
        return new CommentDto(
                comment.getId(),
                comment.getComment(),
                comment.getUser().getUsername(),
                comment.getCreatedDate()
        );
    }
}
