package pl.pwr.edu.KanbanBoard.dto.timeEntry;

import java.time.LocalDate;

public record CreateTimeEntryRequest(
        Integer minutesSpent,
        boolean isOvertime,
        LocalDate entryDate
) {}
