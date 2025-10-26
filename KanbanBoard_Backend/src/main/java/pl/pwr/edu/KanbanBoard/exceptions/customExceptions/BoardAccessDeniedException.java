package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

public class BoardAccessDeniedException extends RuntimeException {
    public BoardAccessDeniedException(String message) {
        super(message);
    }
}
