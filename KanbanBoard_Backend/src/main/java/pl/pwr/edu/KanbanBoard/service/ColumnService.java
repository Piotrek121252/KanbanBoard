package pl.pwr.edu.KanbanBoard.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.Column.ColumnDto;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.repository.ColumnRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ColumnService {

    private final ColumnRepository columnRepository;

    public ColumnService(ColumnRepository columnRepository) {
        this.columnRepository = columnRepository;
    }

    public List<ColumnDto> getColumnsByBoard(Board board) {
        return board.getColumns().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ColumnDto createColumn(Board board, String name, Integer position) {
        ColumnEntity column = new ColumnEntity();
        column.setBoard(board);
        column.setName(name);
        column.setPosition(position);
        ColumnEntity saved = columnRepository.save(column);
        return toDto(saved);
    }

    public void createDefaultColumns(Board board) {
        createColumn(board, "TO-DO", 1);
        createColumn(board, "In-Progress", 2);
        createColumn(board, "Done", 3);
    }

    @Transactional
    public ColumnDto updateColumn(Integer columnId, String name, Integer position) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kolumny"));
        if (name != null) column.setName(name);
        if (position != null) column.setPosition(position);
        return toDto(column);
    }

    public void deleteColumn(Integer columnId) {
        ColumnEntity column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono kolumny"));

        if (!column.getTasks().isEmpty()) {
            throw new RuntimeException("Nie mozna usunac kolumny, ktora ma przypisane zadania");
        }

        columnRepository.delete(column);
    }

    private ColumnDto toDto(ColumnEntity column) {
        return new ColumnDto(
                column.getId(),
                column.getBoard().getId(),
                column.getName(),
                column.getPosition()
        );
    }
}
