package pl.pwr.edu.KanbanBoard.exceptions.customExceptions;

import lombok.Getter;
import pl.pwr.edu.KanbanBoard.model.BoardRole;

@Getter
public class InsufficientBoardRoleException extends RuntimeException {
    private final BoardRole requiredRole;
    private final BoardRole userRole;

    public InsufficientBoardRoleException(BoardRole requiredRole, BoardRole userRole) {
        super(String.format("Akcja wymaga posiadania conajmniej roli: %s, ale użytkownik posiada jedynie role: %s", requiredRole, userRole));
        this.requiredRole = requiredRole;
        this.userRole = userRole;
    }

}
