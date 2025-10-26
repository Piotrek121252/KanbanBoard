package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(Integer id) {
        super("Nie znaleziono zadania z id równym: " + id);
    }
}
