package pl.pwr.edu.KanbanBoard.dto.timeEntry;

import java.time.LocalDate;

public record TimeEntryDto(
        Integer id,
        Integer taskId,
        Integer userId,
        String username,
        int minutesSpent,
        boolean isOvertime,
        LocalDate entryDate
) {}