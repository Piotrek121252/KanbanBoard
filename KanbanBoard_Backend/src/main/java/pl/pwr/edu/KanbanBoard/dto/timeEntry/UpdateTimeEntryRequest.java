package pl.pwr.edu.KanbanBoard.dto.timeEntry;

import java.time.LocalDate;

public record UpdateTimeEntryRequest(
        int minutesSpent,
        boolean isOvertime,
        LocalDate entryDate
) {}
