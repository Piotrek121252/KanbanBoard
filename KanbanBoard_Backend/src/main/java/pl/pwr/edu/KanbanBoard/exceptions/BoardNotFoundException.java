package pl.pwr.edu.KanbanBoard.exceptions;

public class BoardNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1;

    public BoardNotFoundException(String message) {
        super(message);
    }
}
