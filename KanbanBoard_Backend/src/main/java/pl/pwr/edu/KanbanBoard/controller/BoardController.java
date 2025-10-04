package pl.pwr.edu.KanbanBoard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import pl.pwr.edu.KanbanBoard.dto.Board.BoardDto;
import pl.pwr.edu.KanbanBoard.dto.Board.CreateBoardDto;
import pl.pwr.edu.KanbanBoard.service.BoardService;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

        private final BoardService boardService;

        @GetMapping
        public List<BoardDto> getAllBoards() {
            return boardService.getAllBoards();
        }

        @GetMapping("/{id}")
        public ResponseEntity<BoardDto> getBoardById(@PathVariable Integer id) {
            return ResponseEntity.ok(boardService.getBoardById(id));
        }

        @PostMapping
        public ResponseEntity<BoardDto> createBoard(@RequestBody CreateBoardDto createBoardDto, @AuthenticationPrincipal UserDetails userDetails) {
            return ResponseEntity.ok(boardService.createBoard(createBoardDto, userDetails.getUsername()));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteBoard(@PathVariable Integer id) {
            boardService.deleteBoard(id);
            return ResponseEntity.noContent().build();
        }
}
