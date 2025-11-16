package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
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
    public ResponseEntity<ColumnDto> createColumn(
            @PathVariable Integer boardId,
            @RequestBody CreateColumnRequest request,
            @AuthenticationPrincipal User user
    ) {
        ColumnDto created = columnService.createColumn(boardId, request, user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{columnId}")
    public ResponseEntity<ColumnDto> updateColumn(@PathVariable Integer boardId,
                                                  @PathVariable Integer columnId,
                                                  @RequestBody CreateColumnRequest request,
                                                  @AuthenticationPrincipal User user) {
        ColumnDto updated = columnService.updateColumn(boardId, columnId, request, user.getUsername());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Integer boardId,
                                             @PathVariable Integer columnId,
                                             @AuthenticationPrincipal User user) {

        columnService.deleteColumn(boardId, columnId, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{columnId}/position")
    public ResponseEntity<ColumnDto> updatePosition(
            @PathVariable Integer boardId,
            @PathVariable Integer columnId,
            @RequestBody ChangeColumnPositionRequest dto,
            @AuthenticationPrincipal User user) {

        ColumnDto columnDto = columnService.updateColumnPositionWithRoleCheck(columnId, dto.newPosition(), user.getUsername());
        return ResponseEntity.ok(columnDto);
    }
}