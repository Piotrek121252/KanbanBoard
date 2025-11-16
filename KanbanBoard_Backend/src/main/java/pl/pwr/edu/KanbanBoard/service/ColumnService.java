package pl.pwr.edu.KanbanBoard.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.column.ColumnDto;
import pl.pwr.edu.KanbanBoard.dto.column.CreateColumnRequest;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.ColumnNotFoundException;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.BoardRole;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.model.UserEntity;
import pl.pwr.edu.KanbanBoard.repository.ColumnRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.ColumnMapper;

import java.util.List;
import java.util.Set;

@Service
public class ColumnService {

    private static final Set<String> VALID_COLORS = Set.of(
            "#3730a3", "#15803d", "#b91c1c", "#b45309", "#0369a1", "#4b5563"
    );

    private final ColumnRepository columnRepository;
    private final BoardService boardService;
    private final ColumnMapper columnMapper;
    private final UserService userService;

    @Autowired
    public ColumnService(ColumnRepository columnRepository, BoardService boardService, ColumnMapper columnMapper, UserService userService) {
        this.columnRepository = columnRepository;
        this.boardService = boardService;
        this.columnMapper = columnMapper;
        this.userService = userService;
    }

    public List<ColumnDto> getColumnsByBoardId(Integer boardId) {
        Board board = boardService.getBoardEntityById(boardId);
        List<ColumnEntity> columns = columnRepository.findByBoardOrderByPosition(board);

        return columnMapper.toDtoList(columns);
    }

    public ColumnDto createColumn(Integer boardId, CreateColumnRequest request, String username) {
        Board board = boardService.getBoardEntityById(boardId);
        UserEntity user = userService.getUserByUsername(username);

        // Sprawdzamy czy użytkownik ma odpowiednią role
        boardService.requireRole(board, user, BoardRole.EDITOR);

        // Sprawdzamy czy wybrany kolor znajduje się na liście
        String color = request.color() != null ? request.color() : "#4b5563";
        if (!VALID_COLORS.contains(color)) {
            throw new IllegalArgumentException("Nieprawidłowy kolor " + request.color() + ". Dozwolone: " + VALID_COLORS);
        }

        List<ColumnEntity> columns = columnRepository.findByBoardOrderByPosition(board);
        int maxPosition = columns.size() + 1;
        int newPosition = Math.max(1, Math.min(request.position() != null ? request.position() : maxPosition, maxPosition));

        for (ColumnEntity col : columns) {
            if (col.getPosition() >= newPosition) {
                col.setPosition(col.getPosition() + 1);
            }
        }
        columnRepository.saveAll(columns);

        ColumnEntity column = new ColumnEntity();
        column.setBoard(board);
        column.setName(request.name());
        column.setPosition(newPosition);
        column.setColor(request.color() != null ? request.color() : "#4b5563");

        ColumnEntity saved = columnRepository.save(column);
        return columnMapper.apply(saved);
    }

    public ColumnDto updateColumn(Integer boardId, Integer columnId, CreateColumnRequest request, String username) {
        ColumnEntity column = getColumnEntityByIdAndBoard(columnId, boardId);
        Board board = column.getBoard();
        UserEntity currentUser = userService.getUserByUsername(username);

        // Sprawdzamy czy użytkownik ma wymaganą role
        boardService.requireRole(board, currentUser, BoardRole.EDITOR);

        if (request.name() != null) {
            column.setName(request.name());
        }

        if (request.position() != null) {
            updateColumnPosition(columnId, request.position());
        }

        if (request.color() != null) {
            if (!VALID_COLORS.contains(request.color())) {
                throw new IllegalArgumentException("Nieprawidłowy kolor " + request.color() + ". Dozwolone: " + VALID_COLORS);
            }
            column.setColor(request.color());
        }

        ColumnEntity saved = columnRepository.save(column);
        return columnMapper.apply(saved);
    }


    public void deleteColumn(Integer boardId, Integer columnId, String username) {
        ColumnEntity column = getColumnEntityByIdAndBoard(columnId, boardId);
        Board board = column.getBoard();
        UserEntity currentUser = userService.getUserByUsername(username);

        // Sprawdzamy czy użytkownik ma wymaganą role
        boardService.requireRole(board, currentUser, BoardRole.EDITOR);

        if (!column.getTasks().isEmpty()) {
            throw new IllegalStateException("Nie można usunąć kolumny, która ma przypisane zadania");
        }

        int deletedPosition = column.getPosition();

        columnRepository.delete(column);

        // Aktualizacja pozycji pozostałych kolumn
        List<ColumnEntity> columns = columnRepository.findByBoardOrderByPosition(board);
        for (ColumnEntity col : columns) {
            if (col.getPosition() > deletedPosition) {
                col.setPosition(col.getPosition() - 1);
            }
        }
        columnRepository.saveAll(columns);
    }

    public ColumnDto updateColumnPositionWithRoleCheck(Integer columnId, Integer newPosition, String username) {
        ColumnEntity column = getColumnEntityById(columnId);
        UserEntity currentUser = userService.getUserByUsername(username);
        boardService.requireRole(column.getBoard(), currentUser, BoardRole.EDITOR);

        return updateColumnPosition(columnId, newPosition);
    }

    public ColumnDto updateColumnPosition(Integer columnId, Integer newPosition) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ColumnNotFoundException(columnId));

        List<ColumnEntity> columns = columnRepository.findByBoardOrderByPosition(column.getBoard());
        int maxPosition = columns.size();
        newPosition = Math.max(1, Math.min(newPosition, maxPosition));
        int oldPosition = column.getPosition();

        if (newPosition != oldPosition) {
            for (ColumnEntity col : columns) {
                if (oldPosition < newPosition && col.getPosition() > oldPosition && col.getPosition() <= newPosition) {
                    col.setPosition(col.getPosition() - 1);
                } else if (oldPosition > newPosition && col.getPosition() < oldPosition && col.getPosition() >= newPosition) {
                    col.setPosition(col.getPosition() + 1);
                }
            }
            column.setPosition(newPosition);
            columnRepository.saveAll(columns);
            columnRepository.save(column);
        }

        return columnMapper.apply(column);
    }

    ColumnEntity getColumnEntityByIdAndBoard(Integer columnId, Integer boardId) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ColumnNotFoundException(columnId));

        if (!column.getBoard().getId().equals(boardId)) {
            throw new IllegalArgumentException("Kolumna nie należy do tej tablicy");
        }
        return column;
    }

    public ColumnDto getColumnByIdAndBoard(Integer columnId, Integer boardId) {
        ColumnEntity column = getColumnEntityByIdAndBoard(columnId, boardId);
        return columnMapper.apply(column);
    }

    ColumnEntity getColumnEntityById(Integer columnId) {
        return columnRepository.findById(columnId)
                .orElseThrow(() -> new ColumnNotFoundException(columnId));
    }
}