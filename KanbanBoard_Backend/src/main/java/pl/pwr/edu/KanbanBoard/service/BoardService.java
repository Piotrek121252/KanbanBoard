package pl.pwr.edu.KanbanBoard.service;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.board.BoardDto;
import pl.pwr.edu.KanbanBoard.dto.board.CreateBoardDto;
import pl.pwr.edu.KanbanBoard.exceptions.BoardNotFoundException;
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
    private final UserService userService;
    private final ColumnService columnService;
    private final BoardDtoMapper boardDtoMapper;


    public BoardService(BoardRepository boardRepository, UserService userService, ColumnService columnService, BoardDtoMapper boardDtoMapper) {
        this.boardRepository = boardRepository;
        this.userService = userService;
        this.columnService = columnService;
        this.boardDtoMapper = boardDtoMapper;
    }

    public List<BoardDto> getAllBoards() {
        return boardRepository.findAll().stream()
                .map(boardDtoMapper)
                .collect(Collectors.toList());
    }

    public BoardDto getBoardById(Integer id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BoardNotFoundException("Board not found with id: " + id));
        return boardDtoMapper.apply(board);
    }

    public BoardDto createBoard(CreateBoardDto createBoardDto, String username) {
        Board board = new Board();
        board.setName(createBoardDto.name());
        board.setIsPublic(createBoardDto.isPublic());

        UserEntity currentUser = userService.getUserByUsername(username);
        board.getMembers().add(currentUser);

        Board saved = boardRepository.save(board);

        columnService.createDefaultColumns(saved);

        return boardDtoMapper.apply(saved);
    }

    public void deleteBoard(Integer id) {
        if (!boardRepository.existsById(id)) {
            throw new BoardNotFoundException("Board not found with id: " + id);
        }
        boardRepository.deleteById(id);
    }
}