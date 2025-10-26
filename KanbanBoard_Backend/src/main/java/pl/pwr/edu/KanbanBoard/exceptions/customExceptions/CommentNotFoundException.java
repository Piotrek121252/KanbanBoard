package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

public class CommentNotFoundException extends RuntimeException {
    public CommentNotFoundException(Integer id) {
        super("Comment not found with id: " + id);
    }
}
