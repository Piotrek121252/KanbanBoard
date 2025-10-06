package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.Column.ColumnDto;
import pl.pwr.edu.KanbanBoard.dto.Column.CreateColumnDto;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.repository.BoardRepository;
import pl.pwr.edu.KanbanBoard.service.ColumnService;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/columns")
public class ColumnController {

    private final BoardRepository boardRepository;
    private final ColumnService columnService;

    @Autowired
    public ColumnController(BoardRepository boardRepository, ColumnService columnService) {
        this.boardRepository = boardRepository;
        this.columnService = columnService;
    }

    @GetMapping
    public List<ColumnDto> getColumns(@PathVariable Integer boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        return columnService.getColumnsByBoard(board);
    }

    @PostMapping
    public ColumnDto createColumn(@PathVariable Integer boardId,
                                  @RequestBody CreateColumnDto dto) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono tablicy"));
        return columnService.createColumn(board, dto.getName(), dto.getPosition());
    }

    @PutMapping("/{columnId}")
    public ColumnDto updateColumn(@PathVariable Integer boardId,
                                  @PathVariable Integer columnId,
                                  @RequestBody CreateColumnDto dto) {
        // TODO - walidacja czy columna należy do danej tablicy
        return columnService.updateColumn(columnId, dto.getName(), dto.getPosition());
    }

    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Integer boardId,
                                             @PathVariable Integer columnId) {
        // TODO - walidacja czy columna należy do danej tablicy [column.getBoard().getId().equals(boardId)]
        columnService.deleteColumn(columnId);
        return ResponseEntity.noContent().build();
    }

}
