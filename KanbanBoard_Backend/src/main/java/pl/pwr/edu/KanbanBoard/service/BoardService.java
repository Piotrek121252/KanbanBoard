package pl.pwr.edu.KanbanBoard.service;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.board.BoardDto;
import pl.pwr.edu.KanbanBoard.dto.board.CreateBoardRequest;
import pl.pwr.edu.KanbanBoard.dto.board.UpdateBoardRequest;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.BoardAccessDeniedException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.BoardNotFoundException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.IllegalBoardRoleException;
import pl.pwr.edu.KanbanBoard.model.*;
import pl.pwr.edu.KanbanBoard.repository.BoardMemberRepository;
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
    private final BoardMemberRepository boardMemberRepository;
    private final ColumnRepository columnRepository;
    private final BoardMapper boardMapper;


    public BoardService(BoardRepository boardRepository, UserService userService, BoardMemberRepository boardMemberRepository, BoardMapper boardMapper, ColumnRepository columnRepository) {
        this.boardRepository = boardRepository;
        this.userService = userService;
        this.boardMemberRepository = boardMemberRepository;
        this.columnRepository = columnRepository;
        this.boardMapper = boardMapper;
    }

    public List<BoardDto> getAllBoards(String username) {
        UserEntity user = userService.getUserByUsername(username);

        return boardRepository.findAll().stream()
                .filter(board -> board.getIsPublic() ||
                        board.getBoardMembers().stream()
                                .anyMatch(member -> member.getUser().equals(user)))
                .map(board -> boardMapper.toDto(board, user))
                .collect(Collectors.toList());
    }


    public BoardDto getBoardById(Integer id, String username) {
        UserEntity user = userService.getUserByUsername(username);
        Board board = getBoardEntityById(id);

        return boardMapper.toDto(board, user);
    }

    Board getBoardEntityById(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new BoardNotFoundException("Nie znaleziono tablicy z id: " + id));
    }

    public BoardDto createBoard(CreateBoardRequest createBoardDto, String username) {
        UserEntity currentUser = userService.getUserByUsername(username);

        Board board = new Board();
        board.setName(createBoardDto.name());
        board.setIsPublic(createBoardDto.isPublic());

        board.setCreatedDate(LocalDateTime.now());
        Board saved = boardRepository.save(board);

        BoardMember owner = new BoardMember();
        owner.setBoard(saved);
        owner.setUser(currentUser);
        owner.setRole(BoardRole.ADMIN);
        boardMemberRepository.save(owner);

        createDefaultColumns(saved);

        return boardMapper.toDto(saved, currentUser);
    }

    public void deleteBoard(Integer id) {
        if (!boardRepository.existsById(id)) {
            throw new BoardNotFoundException("Board not found with id: " + id);
        }
        boardRepository.deleteById(id);
    }

    public BoardDto updateBoard(Integer boardId, UpdateBoardRequest request, String actorUsername) {
        Board board = getBoardEntityById(boardId);
        UserEntity actor = userService.getUserByUsername(actorUsername);

        requireRole(board, actor, BoardRole.ADMIN);

        if (request.name() != null) board.setName(request.name());
        if (request.isPublic() != null) board.setIsPublic(request.isPublic());

        boardRepository.save(board);
        return boardMapper.toDto(board, actor);
    }

    private void createDefaultColumns(Board board) {
        List<ColumnEntity> defaultColumns = List.of(
                new ColumnEntity(board, "TO-DO", 1),
                new ColumnEntity(board, "In-Progress", 2),
                new ColumnEntity(board, "Done", 3)
        );
        columnRepository.saveAll(defaultColumns);
    }

    public void addMember(Integer boardId, Integer userId, String roleName, String actorUsername) {
        Board board = getBoardEntityById(boardId);
        UserEntity actor = userService.getUserByUsername(actorUsername);
        requireRole(board, actor, BoardRole.ADMIN);

        UserEntity userToAdd = userService.getUserByUserId(userId);

        BoardRole role = parseBoardRole(roleName);

        if (boardMemberRepository.existsByBoardAndUser(board, userToAdd)) {
            throw new RuntimeException("Użytkownik już jest członkiem tej tablicy");
        }

        BoardMember member = new BoardMember();
        member.setBoard(board);
        member.setUser(userToAdd);
        member.setRole(role);
        boardMemberRepository.save(member);
    }

    public void removeMember(Integer boardId, Integer userId, String actorUsername) {
        Board board = getBoardEntityById(boardId);
        UserEntity actor = userService.getUserByUsername(actorUsername);
        requireRole(board, actor, BoardRole.ADMIN);

        BoardMember member = boardMemberRepository.findByBoardAndUser(board, userService.getUserByUserId(userId))
                .orElseThrow(() -> new RuntimeException("Użytkownik nie jest członkiem tej tablicy"));

        boardMemberRepository.delete(member);
    }

    public void changeMemberRole(Integer boardId, Integer userId, String newRoleName, String actorUsername) {
        Board board = getBoardEntityById(boardId);
        UserEntity actor = userService.getUserByUsername(actorUsername);
        requireRole(board, actor, BoardRole.ADMIN);

        BoardMember member = boardMemberRepository.findByBoardAndUser(board, userService.getUserByUserId(userId))
                .orElseThrow(() -> new RuntimeException("Użytkownik nie jest członkiem tej tablicy"));

        BoardRole newRole = parseBoardRole(newRoleName);

        member.setRole(newRole);
        boardMemberRepository.save(member);
    }


    public BoardMember getMembership(Board board, UserEntity user) {
        return boardMemberRepository.findByBoardAndUser(board, user)
                .orElseThrow(() -> new BoardAccessDeniedException("Użytkownik nie jest członkiem tej tablicy"));
    }

    public void requireRole(Board board, UserEntity user, BoardRole minimumRole) {
        BoardMember member = getMembership(board, user);
        if (member.getRole().ordinal() > minimumRole.ordinal()) {
            throw new BoardAccessDeniedException("Użytkownik nie ma odpowiednich uprawnień do wykonania tej czynności");
        }
    }

    BoardRole parseBoardRole(String roleName) {
        try {
            return BoardRole.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalBoardRoleException("Podana rola jest niewłaściwa: " + roleName);
        }
    }
}