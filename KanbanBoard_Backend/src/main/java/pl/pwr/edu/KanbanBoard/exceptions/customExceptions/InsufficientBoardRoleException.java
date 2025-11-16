package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

import pl.pwr.edu.KanbanBoard.model.BoardRole;

public class InsufficientBoardRoleException extends RuntimeException {
    private final BoardRole requiredRole;
    private final BoardRole userRole;

    public InsufficientBoardRoleException(BoardRole requiredRole, BoardRole userRole) {
        super(String.format("Action requires role %s, but user has role %s", requiredRole, userRole));
        this.requiredRole = requiredRole;
        this.userRole = userRole;
    }

    public BoardRole getRequiredRole() { return requiredRole; }
    public BoardRole getUserRole() { return userRole; }
}
