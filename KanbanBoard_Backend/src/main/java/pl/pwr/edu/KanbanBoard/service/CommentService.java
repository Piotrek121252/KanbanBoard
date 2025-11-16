package pl.pwr.edu.KanbanBoard.service;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.comment.CommentDto;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.BoardAccessDeniedException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.CommentNotFoundException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.InsufficientBoardRoleException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.UnauthorizedCommentDeleteException;
import pl.pwr.edu.KanbanBoard.model.*;
import pl.pwr.edu.KanbanBoard.repository.CommentRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.CommentMapper;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final CommentMapper commentMapper;
    private final BoardService boardService;

    public CommentService(CommentRepository commentRepository, TaskService taskService, UserService userService, CommentMapper commentMapper, BoardService boardService) {
        this.commentRepository = commentRepository;
        this.taskService = taskService;
        this.userService = userService;
        this.commentMapper = commentMapper;
        this.boardService= boardService;
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

        Board board = task.getColumn().getBoard();
        boardService.requireRole(board, user, BoardRole.VIEWER);

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setComment(text);
        comment.setCreatedDate(LocalDateTime.now());

        Comment saved = commentRepository.save(comment);
        return commentMapper.apply(saved);
    }


    public void deleteComment(Integer commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));

        UserEntity user = userService.getUserByUsername(username);
        Board board = comment.getTask().getColumn().getBoard();

        boolean isOwner = comment.getUser().getId().equals(user.getId());

        if (!isOwner) {
            // Admin or Editor can delete others’ comments
            try {
                boardService.requireRole(board, user, BoardRole.ADMIN);
            } catch (InsufficientBoardRoleException ex) {
                throw new UnauthorizedCommentDeleteException();
            }
        }

        commentRepository.delete(comment);
    }
}
