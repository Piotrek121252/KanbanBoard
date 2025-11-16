package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

public class TaskHasTimeEntriesException extends RuntimeException {
    public TaskHasTimeEntriesException(String message) {
        super(message);
    }
}