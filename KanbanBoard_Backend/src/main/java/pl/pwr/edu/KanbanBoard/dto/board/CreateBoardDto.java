package pl.pwr.edu.KanbanBoard.dto.board;


public record CreateBoardDto(
        String name,
        Boolean isPublic
) {}
