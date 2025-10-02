package pl.pwr.edu.KanbanBoard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.model.Task;
import pl.pwr.edu.KanbanBoard.service.TaskService;

import java.util.List;

@RestController
@RequestMapping("/api/columns/{columnId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public Task createTask(@PathVariable Long columnId, @RequestBody Task task) {
        return taskService.createTask(columnId, task);
    }

    @GetMapping
    public List<Task> getTasks(@PathVariable Long columnId) {
        return taskService.getTasksByColumn(columnId);
    }
}
