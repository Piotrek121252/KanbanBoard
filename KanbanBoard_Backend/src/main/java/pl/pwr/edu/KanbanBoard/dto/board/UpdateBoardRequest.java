package pl.pwr.edu.KanbanBoard.dto.board;

public record UpdateBoardRequest(
        String name,
        Boolean isPublic
) {
}
