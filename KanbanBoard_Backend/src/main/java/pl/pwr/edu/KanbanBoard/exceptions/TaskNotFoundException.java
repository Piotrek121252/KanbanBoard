package pl.pwr.edu.KanbanBoard.exceptions;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(Integer id) {
        super("Nie znaleziono zadania z id równym: " + id);
    }
}
