package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

public class TimeEntryNotFoundException extends RuntimeException {
    public TimeEntryNotFoundException(Integer id) {
        super("Time entry not found with id: " + id);
    }
}