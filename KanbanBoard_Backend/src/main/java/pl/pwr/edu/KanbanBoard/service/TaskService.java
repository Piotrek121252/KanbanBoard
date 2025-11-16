package pl.pwr.edu.KanbanBoard.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.task.ChangeTaskPositionRequest;
import pl.pwr.edu.KanbanBoard.dto.task.CreateTaskRequest;
import pl.pwr.edu.KanbanBoard.dto.task.TaskDto;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.TaskHasTimeEntriesException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.TaskNotFoundException;
import pl.pwr.edu.KanbanBoard.model.*;
import pl.pwr.edu.KanbanBoard.repository.TaskRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.TaskMapper;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private static final int POSITION_GAP = 65536;
    private static final int MIN_GAP = 10;
    private final TaskRepository taskRepository;
    private final ColumnService columnService;
    private final TaskMapper taskMapper;
    private final UserService userService;
    private final BoardService boardService;

    @Autowired
    public TaskService(TaskRepository taskRepository, ColumnService columnService, TaskMapper taskMapper, UserService userService, BoardService boardService) {
        this.taskRepository = taskRepository;
        this.columnService = columnService;
        this.taskMapper = taskMapper;
        this.userService = userService;
        this.boardService = boardService;
    }

    public List<TaskDto> getTasksByColumnId(Integer columnId) {
        ColumnEntity column = columnService.getColumnEntityById(columnId);
        return taskMapper.toDtoList(taskRepository.findByColumnIdOrderByPositionAsc(column.getId()));
    }

    public TaskDto createTask(Integer columnId, CreateTaskRequest request, String username) {

        ColumnEntity column = columnService.getColumnEntityById(columnId);
        Board board = column.getBoard();

        UserEntity actor = userService.getUserByUsername(username);

        // Sprawdzenie czy użytkownik ma odpowiednią rolę
        boardService.requireRole(board, actor, BoardRole.EDITOR);

        Task task = new Task();
        task.setColumn(column);
        task.setName(request.name());
        task.setDescription(request.description());
        task.setIsActive(request.isActive() != null ? request.isActive() : true);
        task.setCreatedDate(LocalDateTime.now());
        if (request.dueDate() != null) {
            if (request.dueDate().isBefore(task.getCreatedDate())) {
                throw new IllegalArgumentException("Deadline nie może być przed datą utworzenia zadania.");
            }
            task.setDueDate(request.dueDate());
        }
        task.setPriority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM);

        // Obliczenie posycji dla nowego zadania
        List<Task> tasks = taskRepository.findByColumnIdOrderByPositionAsc(column.getId());

        int newPosition = request.position() != null
                ? request.position()
                : (tasks.isEmpty()
                ? POSITION_GAP
                : tasks.get(tasks.size() - 1).getPosition() + POSITION_GAP);

        task.setPosition(newPosition);

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
    }


    public TaskDto updateTask(Integer columnId, Integer taskId, CreateTaskRequest request, String username) {

        Task task = getTaskEntityById(taskId);
        ColumnEntity oldColumn = task.getColumn();
        Board board = oldColumn.getBoard();

        UserEntity actor = userService.getUserByUsername(username);

        boardService.requireRole(board, actor, BoardRole.EDITOR);

        if (request.name() != null) task.setName(request.name());
        if (request.description() != null) task.setDescription(request.description());
        if (request.dueDate() != null) {
            if (request.dueDate().isBefore(task.getCreatedDate())) {
                throw new IllegalArgumentException("Deadline nie może być przed datą utworzenia zadania.");
            }
            task.setDueDate(request.dueDate());
        }
        if (request.isActive() != null) task.setIsActive(request.isActive());
        if (request.priority() != null) task.setPriority(request.priority());

        if (!oldColumn.getId().equals(columnId)) {

            ColumnEntity newColumn = columnService.getColumnEntityById(columnId);

            List<Task> oldColumnTasks = taskRepository.findByColumnIdOrderByPositionAsc(oldColumn.getId());
            oldColumnTasks.removeIf(t -> t.getId().equals(taskId));

            List<Task> newColumnTasks = taskRepository.findByColumnIdOrderByPositionAsc(newColumn.getId());
            int newIndex = newColumnTasks.size();

            int newPos = calculateNewTaskPosition(newColumnTasks, task, newIndex);

            task.setColumn(newColumn);
            task.setPosition(newPos);
        }

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
    }


    public TaskDto moveTask(Integer taskId, ChangeTaskPositionRequest request, String username) {

        Task task = getTaskEntityById(taskId);
        Board board = task.getColumn().getBoard();
        UserEntity actor = userService.getUserByUsername(username);

        // Sprawdzenie uprawnień
        boardService.requireRole(board, actor, BoardRole.EDITOR);

        Integer newColumnId = request.newColumnId();
        Integer newIndex = request.newIndex();

        ColumnEntity newColumn = columnService.getColumnEntityById(newColumnId);
        List<Task> tasks = taskRepository.findByColumnIdOrderByPositionAsc(newColumn.getId());

        tasks.removeIf(t -> t.getId().equals(taskId));

        int newPos = calculateNewTaskPosition(tasks, task, newIndex);

        task.setColumn(newColumn);
        task.setPosition(newPos);

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
    }


    private void normalizeColumnPositions(List<Task> tasks) {
        int pos = POSITION_GAP;
        for (Task t : tasks) {
            t.setPosition(pos);
            pos += POSITION_GAP;
        }
        taskRepository.saveAll(tasks);
    }

    private int calculateNewTaskPosition(List<Task> tasks, Task task, int newIndex) {
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

            if (newPos < MIN_GAP) {
                tasks.add(newIndex, task);
                normalizeColumnPositions(tasks);
                newPos = tasks.get(newIndex).getPosition();
                tasks.remove(task);
            }

        } else if (next == null) {
            newPos = prev.getPosition() + POSITION_GAP;

        } else {
            newPos = (prev.getPosition() + next.getPosition()) / 2;

            if ((next.getPosition() - prev.getPosition()) <= MIN_GAP) {
                tasks.add(newIndex, task);
                normalizeColumnPositions(tasks);
                newPos = tasks.get(newIndex).getPosition();
                tasks.remove(task);
            }
        }
        return newPos;
    }

    public TaskDto updateTaskActive(Integer taskId, Boolean isActive, String actorUsername) {
        Task task = getTaskEntityById(taskId);
        Board board = task.getColumn().getBoard();

        // Sprawdzenie czy użytkownik ma odpowiednią role
        UserEntity actor = userService.getUserByUsername(actorUsername);
        boardService.requireRole(board, actor, BoardRole.EDITOR);

        task.setIsActive(isActive);

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
    }

    public TaskDto assignOrUnassignUser(Integer taskId, Integer userId, String actorUsername) {
        Task task = getTaskEntityById(taskId);
        Board board = task.getColumn().getBoard();

        // Sprawdzamy czy użytkownik ma odpowiednią role
        UserEntity actor = userService.getUserByUsername(actorUsername);
        boardService.requireRole(board, actor, BoardRole.EDITOR);

        if (userId == null) {
            task.setAssignedUser(null);
        } else {
            UserEntity assignedUser = userService.getUserByUserId(userId);

            boolean isMember = board.getBoardMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(assignedUser.getId()));
            if (!isMember) {
                throw new IllegalArgumentException("Przypisany użytkownik musi być członkiem tablicy.");
            }

            task.setAssignedUser(assignedUser);
        }

        Task saved = taskRepository.save(task);
        return taskMapper.apply(saved);
    }

    public void deleteTask(Integer taskId, String username) {
        Task task = getTaskEntityById(taskId);
        Board board = task.getColumn().getBoard();

        if (!task.getTimeEntries().isEmpty()) {
            throw new TaskHasTimeEntriesException("Nie można usunąć zadania, które ma zarejestrowany czas.");
        }

        // Sprawdzenie uprawnień
        UserEntity actor = userService.getUserByUsername(username);
        boardService.requireRole(board, actor, BoardRole.EDITOR);

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
