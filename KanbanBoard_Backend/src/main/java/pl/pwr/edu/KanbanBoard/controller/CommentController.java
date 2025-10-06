package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.Comment.CommentDto;
import pl.pwr.edu.KanbanBoard.dto.Comment.CreateCommentDto;
import pl.pwr.edu.KanbanBoard.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
public class CommentController {

    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public List<CommentDto> getComments(@PathVariable Integer taskId) {
        return commentService.getCommentsByTask(taskId);
    }

    @PostMapping
    public CommentDto addComment(@PathVariable Integer taskId,
                                 @RequestBody CreateCommentDto dto,
                                 @AuthenticationPrincipal User user) {
        return commentService.addComment(taskId, user.getUsername(), dto.getComment());
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer taskId,
                                              @PathVariable Integer commentId,
                                              @AuthenticationPrincipal User user) {
        commentService.deleteComment(commentId, user.getUsername());
        return ResponseEntity.noContent().build();
    }

}
