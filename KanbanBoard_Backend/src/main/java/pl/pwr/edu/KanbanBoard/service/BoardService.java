package pl.pwr.edu.KanbanBoard.service;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.board.BoardDto;
import pl.pwr.edu.KanbanBoard.dto.board.CreateBoardDto;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.UserEntity;
import pl.pwr.edu.KanbanBoard.repository.BoardRepository;
import pl.pwr.edu.KanbanBoard.repository.UserRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.BoardDtoMapper;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final ColumnService columnService;
    private final BoardDtoMapper boardDtoMapper;


    public BoardService(BoardRepository boardRepository, UserRepository userRepository, ColumnService columnService, BoardDtoMapper boardDtoMapper) {
        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
        this.columnService = columnService;
        this.boardDtoMapper = boardDtoMapper;
    }

    public List<BoardDto> getAllBoards() {
        return boardRepository.findAll().stream()
                .map(boardDtoMapper)
                .collect(Collectors.toList());
    }

    public Board getBoardById(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));
    }

    public BoardDto createBoard(CreateBoardDto createBoardDto, String username) {
        Board board = new Board();
        board.setName(createBoardDto.getName());
        board.setIsPublic(createBoardDto.getIsPublic());

        UserEntity currentUser = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        board.getMembers().add(currentUser);

        Board saved = boardRepository.save(board);

        columnService.createDefaultColumns(saved);

        return toDto(saved);
    }

    public void deleteBoard(Integer id) {
        if (!boardRepository.existsById(id)) {
            throw new RuntimeException("Board not found");
        }
        boardRepository.deleteById(id);
    }

    public BoardDto toDto(Board board) {
        return new BoardDto(
                board.getId(),
                board.getName(),
                board.getIsPublic(),
                board.getCreatedDate(),
                board.getMembers().stream().map(UserEntity::getId).collect(Collectors.toList())
        );
    }
}