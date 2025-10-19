package pl.pwr.edu.KanbanBoard.service;

import jakarta.persistence.Column;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.column.ColumnDto;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.repository.BoardRepository;
import pl.pwr.edu.KanbanBoard.repository.ColumnRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final BoardRepository boardRepository;

    public ColumnService(ColumnRepository columnRepository, BoardRepository boardRepository) {
        this.columnRepository = columnRepository;
        this.boardRepository = boardRepository;
    }

    public ColumnDto createColumn(Board board, String name, Integer requestedPosition) {
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
        return toDto(saved);
    }

    @Transactional
    public ColumnDto updateColumn(Integer columnId, String name, Integer requestedPosition) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kolumny"));

        if (name != null) {
            column.setName(name);
        }

        if (requestedPosition != null) {
            updateColumnPosition(columnId, requestedPosition);
            column = columnRepository.findById(columnId).orElseThrow();
        }

        return toDto(column);
    }

    public void deleteColumn(Integer columnId) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kolumny"));

        if (!column.getTasks().isEmpty()) {
            throw new RuntimeException("Nie mozna usunać kolumny, ktora ma przypisane zadania");
        }

        columnRepository.delete(column);
    }

    @Transactional
    public ColumnEntity updateColumnPosition(Integer columnId, int newPosition) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        List<ColumnEntity> columns = columnRepository.findByBoardOrderByPosition(column.getBoard());
        int maxPosition = columns.size();
        newPosition = Math.max(1, Math.min(newPosition, maxPosition));

        int oldPosition = column.getPosition();

        if (newPosition == oldPosition) {
            return column;
        }

        // Zmieniamy kolejność innych kolumn, żeby zachować porządek
        for (ColumnEntity col : columns) {
            if (oldPosition < newPosition) {
                if (col.getPosition() > oldPosition && col.getPosition() <= newPosition) {
                    col.setPosition(col.getPosition() - 1);
                }
            } else {
                if (col.getPosition() < oldPosition && col.getPosition() >= newPosition) {
                    col.setPosition(col.getPosition() + 1);
                }
            }
        }

        column.setPosition(newPosition);
        columnRepository.saveAll(columns);
        return columnRepository.save(column);
    }

    public ColumnDto toDto(ColumnEntity column) {
        return new ColumnDto(
                column.getId(),
                column.getBoard().getId(),
                column.getName(),
                column.getPosition()
        );
    }

    public void createDefaultColumns(Board board) {
        createColumn(board, "TO-DO", 1);
        createColumn(board, "In-Progress", 2);
        createColumn(board, "Done", 3);
    }

    public List<ColumnDto> getColumnsByBoard(Board board) {
        return board.getColumns().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ColumnEntity getColumnByIdAndBoard(Integer columnId, Integer boardId) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        if (!column.getBoard().getId().equals(boardId)) {
            throw new RuntimeException("Column does not belong to this board");
        }

        return column;
    }
}