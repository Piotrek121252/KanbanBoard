package pl.pwr.edu.KanbanBoard.exceptions;

public class UnauthorizedCommentDeleteException extends RuntimeException {
    public UnauthorizedCommentDeleteException() {
        super("You can only delete your own comments.");
    }
}
