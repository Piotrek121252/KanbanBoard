package pl.pwr.edu.KanbanBoard.service;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.column.ColumnDto;
import pl.pwr.edu.KanbanBoard.exceptions.ColumnNotFoundException;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.repository.ColumnRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.ColumnMapper;

import java.util.List;

@Service
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final BoardService boardService;
    private final ColumnMapper columnMapper;

    public ColumnService(ColumnRepository columnRepository, BoardService boardService, ColumnMapper columnMapper) {
        this.columnRepository = columnRepository;
        this.boardService = boardService;
        this.columnMapper = columnMapper;
    }

    public List<ColumnDto> getColumnsByBoardId(Integer boardId) {
        Board board = boardService.getBoardEntityById(boardId);
        List<ColumnEntity> columns = columnRepository.findByBoardOrderByPosition(board);

        return columnMapper.toDtoList(columns);
    }

    public ColumnDto createColumn(Integer boardId, String name, Integer requestedPosition) {
        Board board = boardService.getBoardEntityById(boardId);

        List<ColumnEntity> columns = columnRepository.findByBoardOrderByPosition(board);
        int maxPosition = columns.size() + 1;
        int newPosition = Math.max(1, Math.min(requestedPosition != null ? requestedPosition : maxPosition, maxPosition));

        for (ColumnEntity col : columns) {
            if (col.getPosition() >= newPosition) {
                col.setPosition(col.getPosition() + 1);
            }
        }
        columnRepository.saveAll(columns);

        ColumnEntity column = new ColumnEntity();
        column.setBoard(board);
        column.setName(name);
        column.setPosition(newPosition);

        ColumnEntity saved = columnRepository.save(column);
        return columnMapper.apply(saved);
    }

    public ColumnDto updateColumn(Integer boardId, Integer columnId, String name, Integer requestedPosition) {
        ColumnEntity column = getColumnEntityByIdAndBoard(columnId, boardId);

        if (name != null)
            column.setName(name);
        if (requestedPosition != null) {
            updateColumnPosition(columnId, requestedPosition);
        }

        return columnMapper.apply(columnRepository.findById(columnId)
                .orElseThrow(() -> new ColumnNotFoundException(columnId)));
    }

    public void deleteColumn(Integer boardId, Integer columnId) {
        ColumnEntity column = getColumnEntityByIdAndBoard(columnId, boardId);

        if (!column.getTasks().isEmpty()) {
            throw new IllegalStateException("Nie można usunąć kolumny, która ma przypisane zadania");
        }

        int deletedPosition = column.getPosition();
        Board board = column.getBoard();

        // Usuwamy kolumne z repozytorium
        columnRepository.delete(column);

        // Aktualizowanie pozycji pozostałych kolumn
        List<ColumnEntity> columns = columnRepository.findByBoardOrderByPosition(board);
        for (ColumnEntity col : columns) {
            if (col.getPosition() > deletedPosition) {
                col.setPosition(col.getPosition() - 1);
            }
        }
        columnRepository.saveAll(columns);
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