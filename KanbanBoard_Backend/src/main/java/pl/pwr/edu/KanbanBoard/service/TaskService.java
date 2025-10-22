package pl.pwr.edu.KanbanBoard.service;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.task.ChangeTaskPositionRequest;
import pl.pwr.edu.KanbanBoard.dto.task.CreateTaskRequest;
import pl.pwr.edu.KanbanBoard.dto.task.TaskDto;
import pl.pwr.edu.KanbanBoard.exceptions.TaskNotFoundException;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.model.Task;
import pl.pwr.edu.KanbanBoard.repository.TaskRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.TaskMapper;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private static final int POSITION_GAP = 65536;

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

    public TaskDto createTask(Integer columnId, CreateTaskRequest request) {
        ColumnEntity column = columnService.getColumnEntityById(columnId);

        Task task = new Task();
        task.setColumn(column);
        task.setName(request.name());
        task.setDescription(request.description());
        task.setIsActive(request.isActive() != null ? request.isActive() : true);
        task.setCreatedDate(LocalDateTime.now());
        task.setDueDate(request.dueDate());

        List<Task> tasks = taskRepository.findByColumnIdOrderByPositionAsc(column.getId());
        int newPosition = request.position() != null
                ? request.position()
                : (tasks.isEmpty() ? POSITION_GAP : tasks.get(tasks.size() - 1).getPosition() + POSITION_GAP);
        task.setPosition(newPosition);

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

            List<Task> tasksInNewColumn = taskRepository.findByColumnIdOrderByPositionAsc(newColumn.getId());
            int newPos = tasksInNewColumn.isEmpty() ? POSITION_GAP :
                    tasksInNewColumn.get(tasksInNewColumn.size() - 1).getPosition() + POSITION_GAP;
            task.setPosition(newPos);
        }

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
    }

    public TaskDto moveTask(Integer taskId, ChangeTaskPositionRequest request) {
        Task task = getTaskEntityById(taskId);

        Integer newColumnId = request.newColumnId();
        Integer newIndex = request.newIndex();

        ColumnEntity column = columnService.getColumnEntityById(newColumnId);
        List<Task> tasks = taskRepository.findByColumnIdOrderByPositionAsc(column.getId());

        tasks.removeIf(t -> t.getId().equals(taskId));

        if (newIndex > tasks.size()) {
            newIndex = tasks.size();
        }

        Task prev = newIndex == 0 ? null : tasks.get(newIndex - 1);
        Task next = newIndex >= tasks.size() ? null : tasks.get(newIndex);

        int newPos;
        if (prev == null && next == null) {
            newPos = POSITION_GAP;
        } else if (prev == null) {
            newPos = next.getPosition() / 2;
        } else if (next == null) {
            newPos = prev.getPosition() + POSITION_GAP;
        } else {
            newPos = (prev.getPosition() + next.getPosition()) / 2;
        }

        task.setColumn(column);
        task.setPosition(newPos);

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
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
