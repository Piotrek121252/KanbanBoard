package pl.pwr.edu.KanbanBoard.service.mapper;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.TimeEntryDto;
import pl.pwr.edu.KanbanBoard.model.TimeEntry;

import java.util.List;
import java.util.function.Function;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TimeEntryMapper implements Function<TimeEntry, TimeEntryDto> {

    @Override
    public TimeEntryDto apply(TimeEntry entry) {
        return new TimeEntryDto(
                entry.getId(),
                entry.getTask().getId(),
                entry.getUser().getId(),
                entry.getUser().getUsername(),
                entry.getMinutesSpent(),
                entry.isOvertime(),
                entry.getEntryDate()
        );
    }

    public List<TimeEntryDto> toDtoList(List<TimeEntry> entries) {
        return entries.stream().map(this::apply).collect(Collectors.toList());
    }
}

