package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.Task.CreateTaskDto;
import pl.pwr.edu.KanbanBoard.dto.Task.TaskDto;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.repository.ColumnRepository;
import pl.pwr.edu.KanbanBoard.service.TaskService;

import java.util.List;

@RestController
@RequestMapping("/api/columns/{columnId}/tasks")
public class TaskController {

    private final ColumnRepository columnRepository;
    private final TaskService taskService;

    @Autowired
    public TaskController(ColumnRepository columnRepository, TaskService taskService) {
        this.columnRepository = columnRepository;
        this.taskService = taskService;
    }

    @GetMapping
    public List<TaskDto> getTasks(@PathVariable Integer columnId) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kolumny"));
        return taskService.getTasksByColumn(column);
    }

    @PostMapping
    public TaskDto createTask(@PathVariable Integer columnId,
                              @RequestBody CreateTaskDto dto,
                              @AuthenticationPrincipal User user) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kolumny"));
        return taskService.createTask(column, dto);
    }

    @PutMapping("/{taskId}")
    public TaskDto updateTask(@PathVariable Integer columnId,
                              @PathVariable Integer taskId,
                              @RequestBody CreateTaskDto dto,
                              @AuthenticationPrincipal User user) {
        return taskService.updateTask(taskId, dto);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer columnId,
                                           @PathVariable Integer taskId,
                                           @AuthenticationPrincipal User user) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
