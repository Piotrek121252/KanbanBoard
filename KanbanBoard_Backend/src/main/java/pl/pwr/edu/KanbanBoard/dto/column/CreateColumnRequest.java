package pl.pwr.edu.KanbanBoard.dto.column;


public record CreateColumnRequest(
        String name,
        Integer position,
        String color
) {}
