package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.board.AddMemberRequest;
import pl.pwr.edu.KanbanBoard.dto.board.ChangeRoleRequest;
import pl.pwr.edu.KanbanBoard.service.BoardService;
import pl.pwr.edu.KanbanBoard.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/members")
public class BoardMembershipController {
    private final BoardService boardService;
    private final UserService userService;

    @Autowired
    public BoardMembershipController(BoardService boardService, UserService userService) {
        this.boardService = boardService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Void> addMember(@PathVariable Integer boardId,
                                          @RequestBody AddMemberRequest request,
                                          @AuthenticationPrincipal User user) {
        boardService.addMember(boardId, request.userId(), request.role(), user.getUsername());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Integer boardId,
                                             @PathVariable Integer userId,
                                             @AuthenticationPrincipal User user) {
        boardService.removeMember(boardId, userId, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<Void> changeMemberRole(@PathVariable Integer boardId,
                                                 @PathVariable Integer userId,
                                                 @RequestBody ChangeRoleRequest request,
                                                 @AuthenticationPrincipal User user) {
        boardService.changeMemberRole(boardId, userId, request.role(), user.getUsername());
        return ResponseEntity.ok().build();
    }
}
