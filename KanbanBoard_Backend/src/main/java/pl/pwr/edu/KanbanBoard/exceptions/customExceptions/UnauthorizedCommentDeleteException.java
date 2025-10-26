package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

public class UnauthorizedCommentDeleteException extends RuntimeException {
    public UnauthorizedCommentDeleteException() {
        super("You can only delete your own comments.");
    }
}
