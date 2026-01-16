package pl.pwr.edu.KanbanBoard.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import pl.pwr.edu.KanbanBoard.dto.task.CreateTaskRequest;
import pl.pwr.edu.KanbanBoard.dto.task.TaskDto;
import pl.pwr.edu.KanbanBoard.dto.task.ChangeTaskPositionRequest;
import pl.pwr.edu.KanbanBoard.model.*;
import pl.pwr.edu.KanbanBoard.repository.TaskRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.TaskMapper;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ColumnService columnService;
    @Mock private TaskMapper taskMapper;
    @Mock private UserService userService;
    @Mock private BoardService boardService;

    @InjectMocks private TaskService taskService;

    @Test
    void createTask_withValidData_savesTaskSuccessfully() {
        ColumnEntity column = new ColumnEntity();
        column.setId(1);
        Board board = new Board();
        column.setBoard(board);
        CreateTaskRequest request = new CreateTaskRequest("Task1", "Desc", null, null, null, null);
        UserEntity user = new UserEntity();

        when(columnService.getColumnEntityById(1)).thenReturn(column);
        when(userService.getUserByUsername("user")).thenReturn(user);
        doNothing().when(boardService).requireRole(board, user, BoardRole.EDITOR);

        Task savedTask = new Task();
        when(taskRepository.save(any())).thenReturn(savedTask);
        TaskDto dto = new TaskDto(
                1,                   // id
                100,                 // position
                1,                   // columnId
                "Task1",             // name
                "Desc",              // description
                true,                // isActive
                LocalDateTime.now(), // createdDate
                null,                // dueDate
                TaskPriority.MEDIUM, // priority
                null,                // assignedUserId
                null                 // assignedUsername
        );
        when(taskMapper.apply(savedTask)).thenReturn(dto);

        TaskDto result = taskService.createTask(1, request, "user");

        assertEquals(dto, result);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void createTask_withDueDateBeforeCreation_throwsException() {
        ColumnEntity column = new ColumnEntity();
        column.setId(1);
        CreateTaskRequest request = new CreateTaskRequest("Task", "Desc", null,
                LocalDateTime.now().minusDays(1), null, null);
        UserEntity user = new UserEntity();
        Board board = new Board();
        column.setBoard(board);

        when(columnService.getColumnEntityById(1)).thenReturn(column);
        when(userService.getUserByUsername("user")).thenReturn(user);
        doNothing().when(boardService).requireRole(board, user, BoardRole.EDITOR);

        assertThrows(IllegalArgumentException.class,
                () -> taskService.createTask(1, request, "user"));
    }

    @Test
    void createTask_inColumnWithExistingTasks_assignsCorrectPosition() {
        ColumnEntity column = new ColumnEntity();
        column.setId(1);
        Board board = new Board();
        column.setBoard(board);
        CreateTaskRequest request = new CreateTaskRequest("Task", "Desc", null, null, null, null);
        UserEntity user = new UserEntity();
        Task existing = new Task();
        existing.setPosition(100);

        when(columnService.getColumnEntityById(1)).thenReturn(column);
        when(userService.getUserByUsername("user")).thenReturn(user);
        doNothing().when(boardService).requireRole(board, user, BoardRole.EDITOR);
        when(taskRepository.findByColumnIdOrderByPositionAsc(1)).thenReturn(List.of(existing));
        when(taskRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(taskMapper.apply(any())).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            return new TaskDto(
                    t.getId(),
                    t.getPosition() != null ? t.getPosition() : 0,
                    t.getColumn() != null ? t.getColumn().getId() : 0,
                    t.getName() != null ? t.getName() : "mockName",
                    t.getDescription() != null ? t.getDescription() : "mockDesc",
                    t.getIsActive() != null ? t.getIsActive() : true,
                    t.getCreatedDate() != null ? t.getCreatedDate() : LocalDateTime.now(),
                    t.getDueDate(),
                    t.getPriority() != null ? t.getPriority() : TaskPriority.MEDIUM,
                    t.getAssignedUser() != null ? t.getAssignedUser().getId() : null,
                    t.getAssignedUser() != null ? "mockUser" : null
            );
        });

        TaskDto dto = taskService.createTask(1, request, "user");

        assertNotNull(dto);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void updateTask_withValidFields_updatesTaskSuccessfully() {
        Task task = new Task();
        task.setId(1);
        ColumnEntity column = new ColumnEntity();
        column.setId(10);
        Board board = new Board();
        column.setBoard(board);
        task.setColumn(column);

        CreateTaskRequest request = new CreateTaskRequest("New Name", "New Desc", null, null, null, null);
        UserEntity user = new UserEntity();

        when(taskRepository.findById(1)).thenReturn(Optional.of(task));
        when(userService.getUserByUsername("user")).thenReturn(user);
        doNothing().when(boardService).requireRole(board, user, BoardRole.EDITOR);
        when(taskRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(taskMapper.apply(any())).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            return new TaskDto(
                    t.getId(),
                    t.getPosition() != null ? t.getPosition() : 0,
                    t.getColumn() != null ? t.getColumn().getId() : 0,
                    t.getName() != null ? t.getName() : "mockName",
                    t.getDescription() != null ? t.getDescription() : "mockDesc",
                    t.getIsActive() != null ? t.getIsActive() : true,
                    t.getCreatedDate() != null ? t.getCreatedDate() : LocalDateTime.now(),
                    t.getDueDate(),
                    t.getPriority() != null ? t.getPriority() : TaskPriority.MEDIUM,
                    t.getAssignedUser() != null ? t.getAssignedUser().getId() : null,
                    t.getAssignedUser() != null ? "mockUser" : null
            );
        });

        TaskDto result = taskService.updateTask(10, 1, request, "user");

        assertNotNull(result);
        verify(taskRepository).save(task);
        assertEquals("New Name", task.getName());
        assertEquals("New Desc", task.getDescription());
    }

    @Test
    void updateTask_withInvalidDueDate_throwsException() {
        Task task = new Task();
        task.setId(1);
        task.setCreatedDate(LocalDateTime.now());
        ColumnEntity column = new ColumnEntity();
        column.setId(10);
        Board board = new Board();
        column.setBoard(board);
        task.setColumn(column);

        CreateTaskRequest request = new CreateTaskRequest(null, null, null, LocalDateTime.now().minusDays(1), null, null);
        UserEntity user = new UserEntity();

        when(taskRepository.findById(1)).thenReturn(Optional.of(task));
        when(userService.getUserByUsername("user")).thenReturn(user);
        doNothing().when(boardService).requireRole(board, user, BoardRole.EDITOR);

        assertThrows(IllegalArgumentException.class,
                () -> taskService.updateTask(10, 1, request, "user"));
    }

    @Test
    void updateTask_movingTaskToNewColumn_updatesColumnAndPosition() {
        Task task = new Task();
        task.setId(1);
        ColumnEntity oldColumn = new ColumnEntity();
        oldColumn.setId(10);
        Board board = new Board();
        oldColumn.setBoard(board);
        task.setColumn(oldColumn);

        ColumnEntity newColumn = new ColumnEntity();
        newColumn.setId(20);
        when(columnService.getColumnEntityById(20)).thenReturn(newColumn);

        CreateTaskRequest request = new CreateTaskRequest(null, null, null, null, null, null);
        UserEntity user = new UserEntity();

        when(taskRepository.findById(1)).thenReturn(Optional.of(task));
        when(taskRepository.findByColumnIdOrderByPositionAsc(10)).thenReturn(new ArrayList<>());
        when(taskRepository.findByColumnIdOrderByPositionAsc(20)).thenReturn(new ArrayList<>());
        when(userService.getUserByUsername("user")).thenReturn(user);
        doNothing().when(boardService).requireRole(board, user, BoardRole.EDITOR);
        when(taskRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(taskMapper.apply(any())).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            return new TaskDto(
                    t.getId(),
                    t.getPosition() != null ? t.getPosition() : 0,
                    t.getColumn() != null ? t.getColumn().getId() : 0,
                    t.getName() != null ? t.getName() : "mockName",
                    t.getDescription() != null ? t.getDescription() : "mockDesc",
                    t.getIsActive() != null ? t.getIsActive() : true,
                    t.getCreatedDate() != null ? t.getCreatedDate() : LocalDateTime.now(),
                    t.getDueDate(),
                    t.getPriority() != null ? t.getPriority() : TaskPriority.MEDIUM,
                    t.getAssignedUser() != null ? t.getAssignedUser().getId() : null,
                    t.getAssignedUser() != null ? "mockUser" : null
            );
        });

        TaskDto result = taskService.updateTask(20, 1, request, "user");

        assertNotNull(result);
        assertEquals(20, task.getColumn().getId());
    }

    @Test
    void moveTask_withValidRequest_updatesColumnAndPositionCorrectly() {
        Task task = new Task();
        task.setId(1);
        ColumnEntity oldColumn = new ColumnEntity();
        oldColumn.setId(10);
        Board board = new Board();
        oldColumn.setBoard(board);
        task.setColumn(oldColumn);

        ColumnEntity newColumn = new ColumnEntity();
        newColumn.setId(20);
        when(columnService.getColumnEntityById(20)).thenReturn(newColumn);

        ChangeTaskPositionRequest request = new ChangeTaskPositionRequest(20, 0);
        UserEntity user = new UserEntity();

        when(taskRepository.findById(1)).thenReturn(Optional.of(task));
        when(taskRepository.findByColumnIdOrderByPositionAsc(20)).thenReturn(new ArrayList<>());
        when(userService.getUserByUsername("user")).thenReturn(user);
        doNothing().when(boardService).requireRole(board, user, BoardRole.EDITOR);
        when(taskRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(taskMapper.apply(any())).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            return new TaskDto(
                    t.getId(),
                    t.getPosition() != null ? t.getPosition() : 0,
                    t.getColumn() != null ? t.getColumn().getId() : 0,
                    t.getName() != null ? t.getName() : "mockName",
                    t.getDescription() != null ? t.getDescription() : "mockDesc",
                    t.getIsActive() != null ? t.getIsActive() : true,
                    t.getCreatedDate() != null ? t.getCreatedDate() : LocalDateTime.now(),
                    t.getDueDate(),
                    t.getPriority() != null ? t.getPriority() : TaskPriority.MEDIUM,
                    t.getAssignedUser() != null ? t.getAssignedUser().getId() : null,
                    t.getAssignedUser() != null ? "mockUser" : null
            );
        });

        TaskDto result = taskService.moveTask(1, request, "user");

        assertNotNull(result);
        assertEquals(20, task.getColumn().getId());
    }

    @Test
    void updateTaskActive_setsTaskActiveFlag() {
        Task task = new Task();
        task.setId(1);
        ColumnEntity column = new ColumnEntity();
        column.setId(10);
        Board board = new Board();
        column.setBoard(board);
        task.setColumn(column);
        UserEntity user = new UserEntity();

        when(taskRepository.findById(1)).thenReturn(Optional.of(task));
        when(userService.getUserByUsername("user")).thenReturn(user);
        doNothing().when(boardService).requireRole(board, user, BoardRole.EDITOR);
        when(taskRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(taskMapper.apply(any())).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            return new TaskDto(
                    t.getId(),
                    t.getPosition() != null ? t.getPosition() : 0,
                    t.getColumn() != null ? t.getColumn().getId() : 0,
                    t.getName() != null ? t.getName() : "mockName",
                    t.getDescription() != null ? t.getDescription() : "mockDesc",
                    t.getIsActive() != null ? t.getIsActive() : true,
                    t.getCreatedDate() != null ? t.getCreatedDate() : LocalDateTime.now(),
                    t.getDueDate(),
                    t.getPriority() != null ? t.getPriority() : TaskPriority.MEDIUM,
                    t.getAssignedUser() != null ? t.getAssignedUser().getId() : null,
                    t.getAssignedUser() != null ? "mockUser" : null
            );
        });

        TaskDto result = taskService.updateTaskActive(1, false, "user");

        assertNotNull(result);
        assertFalse(task.getIsActive());
    }

    @Test
    void assignOrUnassignUser_assignsUser_whenUserIsBoardMember() {
        Task task = new Task();
        ColumnEntity column = new ColumnEntity();
        column.setId(10);
        Board board = new Board();
        column.setBoard(board);
        task.setColumn(column);

        UserEntity actor = new UserEntity();
        UserEntity assigned = new UserEntity();
        assigned.setId(2);
        BoardMember member = new BoardMember();
        member.setUser(assigned);
        board.setBoardMembers(List.of(member));

        when(taskRepository.findById(1)).thenReturn(Optional.of(task));
        when(userService.getUserByUsername("actor")).thenReturn(actor);
        when(userService.getUserByUserId(2)).thenReturn(assigned);
        doNothing().when(boardService).requireRole(board, actor, BoardRole.EDITOR);
        when(taskRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(taskMapper.apply(any())).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            return new TaskDto(
                    t.getId(),
                    t.getPosition() != null ? t.getPosition() : 0,
                    t.getColumn() != null ? t.getColumn().getId() : 0,
                    t.getName() != null ? t.getName() : "mockName",
                    t.getDescription() != null ? t.getDescription() : "mockDesc",
                    t.getIsActive() != null ? t.getIsActive() : true,
                    t.getCreatedDate() != null ? t.getCreatedDate() : LocalDateTime.now(),
                    t.getDueDate(),
                    t.getPriority() != null ? t.getPriority() : TaskPriority.MEDIUM,
                    t.getAssignedUser() != null ? t.getAssignedUser().getId() : null,
                    t.getAssignedUser() != null ? "mockUser" : null
            );
        });

        TaskDto result = taskService.assignOrUnassignUser(1, 2, "actor");

        assertNotNull(result);
        assertEquals(assigned, task.getAssignedUser());
    }

    @Test
    void assignOrUnassignUser_throwsException_whenUserNotBoardMember() {
        Task task = new Task();
        ColumnEntity column = new ColumnEntity();
        Board board = new Board();
        column.setBoard(board);
        task.setColumn(column);

        UserEntity actor = new UserEntity();
        UserEntity assigned = new UserEntity();
        assigned.setId(2);
        board.setBoardMembers(new ArrayList<>()); // no members

        when(taskRepository.findById(1)).thenReturn(Optional.of(task));
        when(userService.getUserByUsername("actor")).thenReturn(actor);
        when(userService.getUserByUserId(2)).thenReturn(assigned);
        doNothing().when(boardService).requireRole(board, actor, BoardRole.EDITOR);

        assertThrows(IllegalArgumentException.class,
                () -> taskService.assignOrUnassignUser(1, 2, "actor"));
    }
}

