package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

public class ColumnNotFoundException extends RuntimeException {
    public ColumnNotFoundException(String message) {
        super(message);
    }

    public ColumnNotFoundException(Integer columnId) {
        super("Nie znaleziono kolumny z id: " + columnId);
    }
}
