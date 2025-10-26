package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

public class IllegalBoardRoleException extends RuntimeException {
    public IllegalBoardRoleException(String message) {
        super(message);
    }
}
