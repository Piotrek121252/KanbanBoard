package pl.pwr.edu.KanbanBoard.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.board.BoardDto;
import pl.pwr.edu.KanbanBoard.dto.board.CreateBoardRequest;
import pl.pwr.edu.KanbanBoard.exceptions.BoardNotFoundException;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;
import pl.pwr.edu.KanbanBoard.model.UserEntity;
import pl.pwr.edu.KanbanBoard.repository.BoardRepository;
import pl.pwr.edu.KanbanBoard.repository.ColumnRepository;
import pl.pwr.edu.KanbanBoard.service.mapper.BoardMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserService userService;
    private final ColumnRepository columnRepository;
    private final BoardMapper boardMapper;


    public BoardService(BoardRepository boardRepository, UserService userService, BoardMapper boardMapper, ColumnRepository columnRepository) {
        this.boardRepository = boardRepository;
        this.userService = userService;
        this.columnRepository = columnRepository;
        this.boardMapper = boardMapper;
    }

    public List<BoardDto> getAllBoards(String username) {
        UserEntity user = userService.getUserByUsername(username);

        return boardRepository.findAll().stream()
                .map(board -> boardMapper.toDto(board, user))
                .collect(Collectors.toList());
    }

    public BoardDto getBoardById(Integer id, String username) {
        UserEntity user = userService.getUserByUsername(username);

        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BoardNotFoundException("Nie znaleziono tablicy z id: " + id));

        return boardMapper.toDto(board, user);
    }

    public Board getBoardEntityById(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new BoardNotFoundException("Nie znaleziono tablicy z id: " + id));
    }

    public BoardDto createBoard(CreateBoardRequest createBoardDto, String username) {
        UserEntity currentUser = userService.getUserByUsername(username);

        Board board = new Board();
        board.setName(createBoardDto.name());
        board.setIsPublic(createBoardDto.isPublic());
        board.getMembers().add(currentUser);
        board.setCreatedDate(LocalDateTime.now());

        Board saved = boardRepository.save(board);

        createDefaultColumns(saved);

        return boardMapper.toDto(saved, currentUser);
    }

    public void deleteBoard(Integer id) {
        if (!boardRepository.existsById(id)) {
            throw new BoardNotFoundException("Board not found with id: " + id);
        }
        boardRepository.deleteById(id);
    }

    private void createDefaultColumns(Board board) {
        List<ColumnEntity> defaultColumns = List.of(
                new ColumnEntity(board, "TO-DO", 1),
                new ColumnEntity(board, "In-Progress", 2),
                new ColumnEntity(board, "Done", 3)
        );
        columnRepository.saveAll(defaultColumns);
    }
}