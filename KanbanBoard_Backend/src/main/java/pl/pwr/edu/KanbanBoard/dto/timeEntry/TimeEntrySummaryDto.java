package pl.pwr.edu.KanbanBoard.dto.timeEntry;

import java.util.List;

public record TimeEntrySummaryDto(
        Integer taskId,
        String taskName,
        Integer userId,
        String username,
        int totalMinutesSpent,
        List<TimeEntryDto> entries
) {}
