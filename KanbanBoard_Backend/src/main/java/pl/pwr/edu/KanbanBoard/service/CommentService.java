package pl.pwr.edu.KanbanBoard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.Comment.CommentDto;
import pl.pwr.edu.KanbanBoard.model.Comment;
import pl.pwr.edu.KanbanBoard.model.Task;
import pl.pwr.edu.KanbanBoard.model.UserEntity;
import pl.pwr.edu.KanbanBoard.repository.CommentRepository;
import pl.pwr.edu.KanbanBoard.repository.TaskRepository;
import pl.pwr.edu.KanbanBoard.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public List<CommentDto> getCommentsByTask(Integer taskId) {
        return commentRepository.findByTaskIdOrderByCreatedDateAsc(taskId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CommentDto addComment(Integer taskId, String username, String text) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zadania"));

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono uzytkownika"));

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setComment(text);

        Comment saved = commentRepository.save(comment);
        return  toDto(saved);
    }

    public void deleteComment(Integer commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono komentarza"));

        if (!comment.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Komentarz moze byc usuniety tylko przez uzytkownika, ktory go dodal");
        }

        commentRepository.delete(comment);
    }

    private CommentDto toDto(Comment comment) {
        return new CommentDto(
                comment.getId(),
                comment.getComment(),
                comment.getUser().getUsername(),
                comment.getCreatedDate()
        );
    }
}
