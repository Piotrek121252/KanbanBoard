package pl.pwr.edu.KanbanBoard.dto.column;


public record ColumnDto(
        Integer id,
        Integer boardId,
        String name,
        Integer position,
        String color
) {}
