package pl.pwr.edu.KanbanBoard.exceptions;

public class CommentNotFoundException extends RuntimeException {
    public CommentNotFoundException(Integer id) {
        super("Comment not found with id: " + id);
    }
}
