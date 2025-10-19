package pl.pwr.edu.KanbanBoard.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.task.CreateTaskRequest;
import pl.pwr.edu.KanbanBoard.dto.task.TaskDto;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.model.Task;
import pl.pwr.edu.KanbanBoard.repository.ColumnRepository;
import pl.pwr.edu.KanbanBoard.repository.TaskRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;

    public TaskService(TaskRepository taskRepository, ColumnRepository columnRepository) {
        this.taskRepository = taskRepository;
        this.columnRepository = columnRepository;
    }

    public List<TaskDto> getTasksByColumn(ColumnEntity column) {
        return taskRepository.findByColumnIdOrderByCreatedDateAsc(column.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TaskDto createTask(ColumnEntity column, CreateTaskRequest dto) {
        Task task = new Task();
        task.setColumn(column);
        task.setName(dto.getName());
        task.setDescription(dto.getDescription());
        task.setIsActive(true);
        task.setDueDate(dto.getDueDate());

        Task saved = taskRepository.save(task);
        return toDto(saved);
    }

    @Transactional
    public TaskDto updateTask(Integer columnId, Integer taskId, CreateTaskRequest dto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zadania"));

        if (dto.getName() != null) task.setName(dto.getName());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());

        if (!columnId.equals(task.getColumn().getId())) {
            ColumnEntity newColumn = columnRepository.findById(columnId)
                    .orElseThrow(() -> new RuntimeException("Nie znaleziono docelowej kolumny"));
            task.setColumn(newColumn);
        }

        return toDto(task);
    }

    public void deleteTask(Integer taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zadania"));
        taskRepository.delete(task);
    }

    private TaskDto toDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getColumn().getId(),
                task.getName(),
                task.getDescription(),
                task.getIsActive(),
                task.getCreatedDate(),
                task.getDueDate()
        );
    }
}
