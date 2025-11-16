package pl.pwr.edu.KanbanBoard.dto.timeEntry;

public record TimeEntryBoardUserDto(
        Integer id,
        String username,
        boolean isCurrentMember
) {}
