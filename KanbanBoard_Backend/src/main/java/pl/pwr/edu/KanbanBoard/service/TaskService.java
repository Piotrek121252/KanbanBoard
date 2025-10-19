package pl.pwr.edu.KanbanBoard.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.task.CreateTaskRequest;
import pl.pwr.edu.KanbanBoard.dto.task.TaskDto;
import pl.pwr.edu.KanbanBoard.exceptions.TaskNotFoundException;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.model.Task;
import pl.pwr.edu.KanbanBoard.repository.ColumnRepository;
import pl.pwr.edu.KanbanBoard.repository.TaskRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.TaskMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ColumnService columnService;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository, ColumnService columnService, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.columnService = columnService;
        this.taskMapper = taskMapper;
    }

    public List<TaskDto> getTasksByColumnId(Integer columnId) {
        ColumnEntity column = columnService.getColumnEntityById(columnId);
        return taskMapper.toDtoList(taskRepository.findByColumnIdOrderByCreatedDateAsc(column.getId()));
    }

    public TaskDto createTask(Integer columnId, CreateTaskRequest createTaskDto) {
        ColumnEntity column = columnService.getColumnEntityById(columnId);

        Task task = new Task();
        task.setColumn(column);
        task.setName(createTaskDto.name());
        task.setDescription(createTaskDto.description());
        task.setIsActive(true);
        task.setCreatedDate(LocalDateTime.now());
        task.setDueDate(createTaskDto.dueDate());

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
    }

    public TaskDto updateTask(Integer columnId, Integer taskId, CreateTaskRequest request) {
        Task task = getTaskEntityById(taskId);

        if (request.name() != null) task.setName(request.name());
        if (request.description() != null) task.setDescription(request.description());
        if (request.dueDate() != null) task.setDueDate(request.dueDate());
        if (request.isActive() != null) task.setIsActive(request.isActive());

        if (!columnId.equals(task.getColumn().getId())) {
            ColumnEntity newColumn = columnService.getColumnEntityById(columnId);
            task.setColumn(newColumn);
        }

        Task saved = taskRepository.save(task);

        return taskMapper.apply(saved);
    }

    public TaskDto updateTaskActive(Integer taskId, Boolean isActive) {
        Task task = getTaskEntityById(taskId);
        task.setIsActive(isActive);

        Task saved = taskRepository.save(task);

        return taskMapper.apply(task);
    }

    public void deleteTask(Integer taskId) {
        Task task = getTaskEntityById(taskId);
        taskRepository.delete(task);
    }

    Task getTaskEntityById(Integer taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }

    public TaskDto getTaskById(Integer taskId) {
        return taskMapper.apply(getTaskEntityById(taskId));
    }
}
