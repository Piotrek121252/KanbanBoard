package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.column.ColumnDto;
import pl.pwr.edu.KanbanBoard.dto.column.ColumnPositionDto;
import pl.pwr.edu.KanbanBoard.dto.column.CreateColumnDto;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.service.BoardService;
import pl.pwr.edu.KanbanBoard.service.ColumnService;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/columns")
public class ColumnController {

    private final BoardService boardService;
    private final ColumnService columnService;

    @Autowired
    public ColumnController(ColumnService columnService, BoardService boardService) {
        this.columnService = columnService;
        this.boardService = boardService;
    }

    @GetMapping
    public ResponseEntity<List<ColumnDto>> getColumns(@PathVariable Integer boardId) {
        try {
            Board board = boardService.getBoardById(boardId);
            return ResponseEntity.ok(columnService.getColumnsByBoard(board));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ColumnDto> createColumn(@PathVariable Integer boardId,
                                  @RequestBody CreateColumnDto dto) {
        try {
            Board board = boardService.getBoardById(boardId);
            ColumnDto created = columnService.createColumn(board, dto.getName(), dto.getPosition());
            return ResponseEntity.created(null).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{columnId}")
    public ResponseEntity<ColumnDto> updateColumn(@PathVariable Integer boardId,
                                  @PathVariable Integer columnId,
                                  @RequestBody CreateColumnDto dto) {
        try {
            columnService.getColumnByIdAndBoard(columnId, boardId);
            ColumnDto updated = columnService.updateColumn(columnId, dto.getName(), dto.getPosition());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Integer boardId,
                                             @PathVariable Integer columnId) {
        try {
            columnService.getColumnByIdAndBoard(columnId, boardId);
            columnService.deleteColumn(columnId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{columnId}/position")
    public ResponseEntity<ColumnDto> updatePosition(
            @PathVariable Integer boardId,
            @PathVariable Integer columnId,
            @RequestBody ColumnPositionDto dto) {
        try {
            columnService.getColumnByIdAndBoard(columnId, boardId);
            ColumnEntity updated = columnService.updateColumnPosition(columnId, dto.getNewPosition());
            return ResponseEntity.ok(columnService.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
