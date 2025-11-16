package pl.pwr.edu.KanbanBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.board.*;
import pl.pwr.edu.KanbanBoard.service.BoardService;
import pl.pwr.edu.KanbanBoard.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;
    private final UserService userService;

    @Autowired
    public BoardController(BoardService boardService, UserService userService) {
        this.boardService = boardService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<BoardDto>> getAllBoards(@AuthenticationPrincipal User user)
    {
        return ResponseEntity.ok(boardService.getAllBoards(user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDto> getBoardById(@PathVariable Integer id,
                                                 @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(boardService.getBoardById(id, user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<BoardDto> createBoard(@RequestBody CreateBoardRequest createBoardDto, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(boardService.createBoard(createBoardDto, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        boardService.deleteBoard(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BoardDto> updateBoard(@PathVariable Integer id,
                                                @RequestBody UpdateBoardRequest request,
                                                @AuthenticationPrincipal User user) {
        BoardDto updated = boardService.updateBoard(id, request, user.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Void> addFavorite(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        userService.addFavoriteBoard(user.getUsername(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/favorite")
    public ResponseEntity<Void> removeFavorite(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        userService.removeFavoriteBoard(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
