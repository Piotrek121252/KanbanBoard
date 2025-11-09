package pl.pwr.edu.KanbanBoard.service;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.CreateTimeEntryRequest;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.TimeEntryDto;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.UpdateTimeEntryRequest;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.TimeEntryNotFoundException;
import pl.pwr.edu.KanbanBoard.model.Task;
import pl.pwr.edu.KanbanBoard.model.TimeEntry;
import pl.pwr.edu.KanbanBoard.model.UserEntity;
import pl.pwr.edu.KanbanBoard.repository.TimeEntryRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.TimeEntryMapper;

import java.time.LocalDate;
import java.util.List;

@Service
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final TimeEntryMapper timeEntryMapper;

    public TimeEntryService(TimeEntryRepository timeEntryRepository,
                            TaskService taskService,
                            UserService userService,
                            TimeEntryMapper timeEntryMapper) {
        this.timeEntryRepository = timeEntryRepository;
        this.taskService = taskService;
        this.userService = userService;
        this.timeEntryMapper = timeEntryMapper;
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

    public List<TimeEntryDto> getTimeEntriesForTask(Integer taskId) {
        Task task = taskService.getTaskEntityById(taskId);
        return timeEntryMapper.toDtoList(timeEntryRepository.findByTask(task));
    }
}

