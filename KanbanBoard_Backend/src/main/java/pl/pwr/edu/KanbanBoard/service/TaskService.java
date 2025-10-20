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
        return taskMapper.toDtoList(taskRepository.findByColumnIdOrderByPositionAsc(column.getId()));
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

        int maxPosition = taskRepository.findByColumnIdOrderByPositionDesc(column.getId())
                .stream()
                .findFirst()
                .map(Task::getPosition)
                .orElse(0);
        task.setPosition(maxPosition + 1);

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
    }

    public TaskDto updateTask(Integer columnId, Integer taskId, CreateTaskRequest request) {
        Task task = getTaskEntityById(taskId);

        if (request.name() != null) task.setName(request.name());
        if (request.description() != null) task.setDescription(request.description());
        if (request.dueDate() != null) task.setDueDate(request.dueDate());
        if (request.isActive() != null) task.setIsActive(request.isActive());

        ColumnEntity currentColumn = task.getColumn();

        if (!columnId.equals(currentColumn.getId())) {
            ColumnEntity newColumn = columnService.getColumnEntityById(columnId);
            task.setColumn(newColumn);

            if (request.position() != null) {
                task.setPosition(request.position());
                adjustTaskPositions(newColumn.getId(), task.getId(), request.position());
            } else {
                int maxPosition = taskRepository.findByColumnIdOrderByPositionDesc(newColumn.getId())
                        .stream()
                        .findFirst()
                        .map(Task::getPosition)
                        .orElse(0);
                task.setPosition(maxPosition + 1);
            }
        } else if (request.position() != null) {
            // Reorder within same column
            adjustTaskPositions(currentColumn.getId(), task.getId(), request.position());
            task.setPosition(request.position());
        }

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
    }

    private void adjustTaskPositions(Integer columnId, Integer taskId, int newPosition) {
        List<Task> tasks = taskRepository.findByColumnIdOrderByPositionAsc(columnId);

        for (Task t : tasks) {
            if (!t.getId().equals(taskId)) {
                if (t.getPosition() >= newPosition) {
                    t.setPosition(t.getPosition() + 1);
                    taskRepository.save(t);
                }
            }
        }
    }

    public TaskDto updateTaskActive(Integer taskId, Boolean isActive) {
        Task task = getTaskEntityById(taskId);
        task.setIsActive(isActive);

        Task saved = taskRepository.save(task);

        return taskMapper.apply(saved);
    }

    public void deleteTask(Integer taskId) {
        Task task = getTaskEntityById(taskId);
        int deletedPosition = task.getPosition();
        ColumnEntity column = task.getColumn();

        taskRepository.delete(task);

        List<Task> tasks = taskRepository.findByColumnIdOrderByPositionAsc(column.getId());
        for (Task t : tasks) {
            if (t.getPosition() > deletedPosition) {
                t.setPosition(t.getPosition() - 1);
            }
        }
        taskRepository.saveAll(tasks);
    }

    Task getTaskEntityById(Integer taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }

    public TaskDto getTaskById(Integer taskId) {
        return taskMapper.apply(getTaskEntityById(taskId));
    }
}
