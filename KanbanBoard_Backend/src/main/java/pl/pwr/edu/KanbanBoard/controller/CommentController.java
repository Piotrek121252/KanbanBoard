package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.comment.CommentDto;
import pl.pwr.edu.KanbanBoard.dto.comment.CreateCommentRequest;
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
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Integer taskId) {
        return ResponseEntity.ok(commentService.getCommentsByTask(taskId));
    }

    @PostMapping
    public ResponseEntity<CommentDto> addComment(@PathVariable Integer taskId,
                                 @RequestBody CreateCommentRequest request,
                                 @AuthenticationPrincipal User user) {
        CommentDto created = commentService.addComment(taskId, user.getUsername(), request.comment());
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer taskId,
                                              @PathVariable Integer commentId,
                                              @AuthenticationPrincipal User user) {
        commentService.deleteComment(commentId, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
