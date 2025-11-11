package pl.pwr.edu.KanbanBoard.service;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.CreateTimeEntryRequest;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.TimeEntryDto;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.TimeEntrySummaryDto;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.UpdateTimeEntryRequest;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.TimeEntryNotFoundException;
import pl.pwr.edu.KanbanBoard.model.*;
import pl.pwr.edu.KanbanBoard.repository.TimeEntryRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.TimeEntryMapper;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final BoardService boardService;
    private final TimeEntryMapper timeEntryMapper;

    public TimeEntryService(TimeEntryRepository timeEntryRepository,
                            TaskService taskService,
                            UserService userService,
                            BoardService boardService,
                            TimeEntryMapper timeEntryMapper) {
        this.timeEntryRepository = timeEntryRepository;
        this.taskService = taskService;
        this.userService = userService;
        this.timeEntryMapper = timeEntryMapper;
        this.boardService = boardService;
    }

    public TimeEntryDto addTimeEntry(Integer taskId, CreateTimeEntryRequest request, String username) {
        Task task = taskService.getTaskEntityById(taskId);
        UserEntity user = userService.getUserByUsername(username);

        boolean isMember = task.getColumn().getBoard().getBoardMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(user.getId()));
        if (!isMember) {
            throw new IllegalArgumentException("Użytkownik nie jest członkiem tablicy.");
        }

        TimeEntry entry = new TimeEntry();
        entry.setTask(task);
        entry.setUser(user);
        entry.setMinutesSpent(request.minutesSpent());
        entry.setOvertime(request.isOvertime());
        entry.setEntryDate(request.entryDate() != null ? request.entryDate() : LocalDate.now());

        return timeEntryMapper.apply(timeEntryRepository.save(entry));
    }

    public TimeEntryDto updateTimeEntry(Integer taskId, Integer timeEntryId, UpdateTimeEntryRequest request, String username) {
        TimeEntry entry = timeEntryRepository.findById(timeEntryId)
                .orElseThrow(() -> new TimeEntryNotFoundException(timeEntryId));

        if (!entry.getTask().getId().equals(taskId)) {
            throw new IllegalArgumentException("Wpis (time entry) nie należy do podanego zadania.");
        }

        UserEntity user = userService.getUserByUsername(username);
        if (!entry.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Użytkownik nie może usunąć tego wpisu.");
        }

        entry.setMinutesSpent(request.minutesSpent());
        entry.setOvertime(request.isOvertime());
        entry.setEntryDate(request.entryDate());

        TimeEntry saved = timeEntryRepository.save(entry);
        return timeEntryMapper.apply(saved);
    }

    public void deleteTimeEntry(Integer taskId, Integer timeEntryId, String username) {
        TimeEntry entry = timeEntryRepository.findById(timeEntryId)
                .orElseThrow(() -> new TimeEntryNotFoundException(timeEntryId));

        if (!entry.getTask().getId().equals(taskId)) {
            throw new IllegalArgumentException("Wpis (time entry) nie należy do podanego zadania.");
        }

        UserEntity user = userService.getUserByUsername(username);
        if (!entry.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Użytkownik nie może usunąć tego wpisu.");
        }

        timeEntryRepository.delete(entry);
    }

    public List<TimeEntryDto> getTimeEntries(Integer taskId, Integer year, Integer month) {
        List<TimeEntry> entries;

        if (year != null && month != null) {
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            entries = timeEntryRepository.findByTaskIdAndEntryDateBetween(taskId, startDate, endDate);
        } else {
            entries = timeEntryRepository.findByTaskId(taskId);
        }

        return entries.stream().map(timeEntryMapper::apply).toList();
    }

    public List<TimeEntrySummaryDto> getMonthlyBoardSummary(Integer boardId, Integer userId, int month, int year) {
        Board board = boardService.getBoardEntityById(boardId);
        List<TimeEntrySummaryDto> summary = new ArrayList<>();

        for (ColumnEntity column : board.getColumns()) {
            for (Task task : column.getTasks()) {
                LocalDate startDate = LocalDate.of(year, month, 1);
                LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                List<TimeEntry> entries = timeEntryRepository.findByTaskIdAndEntryDateBetween(task.getId(), startDate, endDate);

                if (userId != null) {
                    entries = entries.stream()
                            .filter(e -> e.getUser().getId().equals(userId))
                            .toList();
                }

                Map<Integer, List<TimeEntry>> entriesByUser = entries.stream()
                        .collect(Collectors.groupingBy(e -> e.getUser().getId()));

                for (Map.Entry<Integer, List<TimeEntry>> entry : entriesByUser.entrySet()) {
                    int totalMinutes = entry.getValue().stream()
                            .mapToInt(TimeEntry::getMinutesSpent)
                            .sum();

                    int regularMinutes = entry.getValue().stream()
                            .filter(e -> !e.isOvertime())
                            .mapToInt(TimeEntry::getMinutesSpent)
                            .sum();

                    int overtimeMinutes = entry.getValue().stream()
                            .filter(TimeEntry::isOvertime)
                            .mapToInt(TimeEntry::getMinutesSpent)
                            .sum();

                    String username = entry.getValue().get(0).getUser().getUsername();

                    List<TimeEntryDto> entryDtos = entry.getValue().stream()
                            .map(timeEntryMapper::apply)
                            .toList();

                    summary.add(new TimeEntrySummaryDto(
                            task.getId(),
                            task.getName(),
                            entry.getKey(),
                            username,
                            totalMinutes,
                            regularMinutes,
                            overtimeMinutes,
                            entryDtos
                    ));
                }
            }
        }

        return summary;
    }
}

