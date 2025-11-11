package pl.pwr.edu.KanbanBoard.dto.timeEntry;

import java.util.List;

public record TimeEntrySummaryDto(
        Integer taskId,
        String taskName,
        Integer userId,
        String username,
        Integer totalMinutesSpent,
        Integer regularMinutesSpent,
        Integer overtimeMinutesSpent,
        List<TimeEntryDto> entries
) {}
