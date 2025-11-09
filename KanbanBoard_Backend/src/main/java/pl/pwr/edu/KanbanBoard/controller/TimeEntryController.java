package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.CreateTimeEntryRequest;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.TimeEntryDto;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.UpdateTimeEntryRequest;
import pl.pwr.edu.KanbanBoard.service.TimeEntryService;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/time-entries")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;


    @Autowired
    public TimeEntryController(TimeEntryService timeEntryService) {
        this.timeEntryService = timeEntryService;
    }

    @GetMapping
    public ResponseEntity<List<TimeEntryDto>> getTimeEntries(@PathVariable Integer taskId) {
        return ResponseEntity.ok(timeEntryService.getTimeEntriesForTask(taskId));
    }

    @PostMapping
    public ResponseEntity<TimeEntryDto> addTimeEntry(@PathVariable Integer taskId,
                                                     @RequestBody CreateTimeEntryRequest request,
                                                     @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(timeEntryService.addTimeEntry(taskId, request, user.getUsername()));
    }

    @PutMapping("/{timeEntryId}")
    public ResponseEntity<TimeEntryDto> updateTimeEntry(
            @PathVariable Integer taskId,
            @PathVariable Integer timeEntryId,
            @RequestBody UpdateTimeEntryRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(timeEntryService.updateTimeEntry(taskId, timeEntryId, request, user.getUsername()));
    }

    @DeleteMapping("/{timeEntryId}")
    public ResponseEntity<Void> deleteTimeEntry(
            @PathVariable Integer taskId,
            @PathVariable Integer timeEntryId,
            @AuthenticationPrincipal User user
    ) {
        timeEntryService.deleteTimeEntry(taskId, timeEntryId, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
