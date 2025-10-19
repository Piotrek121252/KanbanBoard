package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.column.ColumnDto;
import pl.pwr.edu.KanbanBoard.dto.column.ChangeColumnPositionRequest;
import pl.pwr.edu.KanbanBoard.dto.column.CreateColumnRequest;
import pl.pwr.edu.KanbanBoard.service.ColumnService;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/columns")
public class ColumnController {

    private final ColumnService columnService;

    @Autowired
    public ColumnController(ColumnService columnService) {
        this.columnService = columnService;
    }

    @GetMapping
    public ResponseEntity<List<ColumnDto>> getColumns(@PathVariable Integer boardId) {
        return ResponseEntity.ok(columnService.getColumnsByBoardId(boardId));
    }

    @PostMapping
    public ResponseEntity<ColumnDto> createColumn(@PathVariable Integer boardId,
                                                  @RequestBody CreateColumnRequest dto) {
        ColumnDto created = columnService.createColumn(boardId, dto.name(), dto.position());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{columnId}")
    public ResponseEntity<ColumnDto> updateColumn(@PathVariable Integer boardId,
                                                  @PathVariable Integer columnId,
                                                  @RequestBody CreateColumnRequest dto) {
        ColumnDto updated = columnService.updateColumn(boardId, columnId, dto.name(), dto.position());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Integer boardId,
                                             @PathVariable Integer columnId) {

        columnService.deleteColumn(boardId, columnId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{columnId}/position")
    public ResponseEntity<ColumnDto> updatePosition(
            @PathVariable Integer boardId,
            @PathVariable Integer columnId,
            @RequestBody ChangeColumnPositionRequest dto) {

        ColumnDto columnDto = columnService.updateColumnPosition(columnId, dto.newPosition());
        return ResponseEntity.ok(columnDto);
    }
}