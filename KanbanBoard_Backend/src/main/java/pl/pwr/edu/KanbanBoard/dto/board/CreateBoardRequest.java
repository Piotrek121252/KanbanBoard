package pl.pwr.edu.KanbanBoard.dto.board;


public record CreateBoardRequest(
        String name,
        Boolean isPublic
) {}
