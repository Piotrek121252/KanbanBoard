package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.graphql.GraphQlProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.task.CreateTaskRequest;
import pl.pwr.edu.KanbanBoard.dto.task.TaskDto;
import pl.pwr.edu.KanbanBoard.dto.task.UpdateTaskStatusRequest;
import pl.pwr.edu.KanbanBoard.service.TaskService;

import java.util.List;

@RestController
@RequestMapping("/api/columns/{columnId}/tasks")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> getTasks(@PathVariable Integer columnId) {
        return ResponseEntity.ok(taskService.getTasksByColumnId(columnId));
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@PathVariable Integer columnId,
                                              @RequestBody CreateTaskRequest request) {
        TaskDto created = taskService.createTask(columnId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Integer columnId,
                                              @PathVariable Integer taskId,
                                              @RequestBody CreateTaskRequest request) {
        TaskDto updated = taskService.updateTask(columnId, taskId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer columnId,
                                           @PathVariable Integer taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{taskId}/active")
    public ResponseEntity<TaskDto> updateTaskActive(
            @PathVariable Integer taskId,
            @RequestBody UpdateTaskStatusRequest request) {

        TaskDto updated = taskService.updateTaskActive(taskId, request.isActive());
        return ResponseEntity.ok(updated);
    }
}
