package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.TimeEntryBoardUserDto;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.TimeEntrySummaryDto;
import pl.pwr.edu.KanbanBoard.service.TimeEntryService;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/time-entries")
public class TimeEntrySummaryController {

    private final TimeEntryService timeEntryService;


    @Autowired
    public TimeEntrySummaryController(TimeEntryService timeEntryService) {
        this.timeEntryService = timeEntryService;
    }

    @GetMapping("/summary")
    public ResponseEntity<List<TimeEntrySummaryDto>> getTimeEntriesSummary(
            @PathVariable Integer boardId,
            @RequestParam(required = false) Integer userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(timeEntryService.getMonthlyBoardSummary(boardId, userId, month, year));
    }

    @GetMapping("/users")
    public ResponseEntity<List<TimeEntryBoardUserDto>> getBoardUsersWithTimeEntries(@PathVariable Integer boardId) {
        return ResponseEntity.ok(timeEntryService.getBoardUsersWithTimeEntries(boardId));
    }
}
