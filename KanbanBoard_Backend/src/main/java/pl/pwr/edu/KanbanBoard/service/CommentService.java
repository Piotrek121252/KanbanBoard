package pl.pwr.edu.KanbanBoard.service;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.comment.CommentDto;
import pl.pwr.edu.KanbanBoard.exceptions.CommentNotFoundException;
import pl.pwr.edu.KanbanBoard.exceptions.UnauthorizedCommentDeleteException;
import pl.pwr.edu.KanbanBoard.model.Comment;
import pl.pwr.edu.KanbanBoard.model.Task;
import pl.pwr.edu.KanbanBoard.model.UserEntity;
import pl.pwr.edu.KanbanBoard.repository.CommentRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.CommentMapper;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final CommentMapper commentMapper;

    public CommentService(CommentRepository commentRepository, TaskService taskService, UserService userService, CommentMapper commentMapper) {
        this.commentRepository = commentRepository;
        this.taskService = taskService;
        this.userService = userService;
        this.commentMapper = commentMapper;
    }

    public List<CommentDto> getCommentsByTask(Integer taskId) {
        return commentRepository.findByTaskIdOrderByCreatedDateAsc(taskId)
                .stream()
                .map(commentMapper)
                .toList();
    }

    public CommentDto addComment(Integer taskId, String username, String text) {
        Task task = taskService.getTaskEntityById(taskId);
        UserEntity user = userService.getUserByUsername(username);

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setComment(text);

        Comment saved = commentRepository.save(comment);
        return commentMapper.apply(saved);
    }

    public void deleteComment(Integer commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));

        if (!comment.getUser().getUsername().equals(username)) {
            throw new UnauthorizedCommentDeleteException();
        }

        commentRepository.delete(comment);
    }
}
