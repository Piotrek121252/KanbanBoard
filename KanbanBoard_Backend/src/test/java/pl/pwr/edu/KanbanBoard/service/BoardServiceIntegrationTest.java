package pl.pwr.edu.KanbanBoard.service;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pl.pwr.edu.KanbanBoard.dto.board.CreateBoardRequest;
import pl.pwr.edu.KanbanBoard.dto.board.BoardDto;
import pl.pwr.edu.KanbanBoard.dto.board.UpdateBoardRequest;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.InsufficientBoardRoleException;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.LastAdminException;
import pl.pwr.edu.KanbanBoard.model.*;
import pl.pwr.edu.KanbanBoard.repository.BoardRepository;
import pl.pwr.edu.KanbanBoard.repository.RoleRepository;
import pl.pwr.edu.KanbanBoard.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BoardServiceIntegrationTest {

    @Autowired
    BoardService boardService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    BoardRepository boardRepository;

    @Autowired
    EntityManager em;

    private UserEntity adminUser;
    private UserEntity normalUser;

    @BeforeEach
    void setup() {
        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        roleRepository.save(adminRole);

        Role userRole = new Role();
        userRole.setName("USER");
        roleRepository.save(userRole);

        adminUser = new UserEntity();
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@test.com");
        adminUser.setPassword("password");
        adminUser.setSignupDate(LocalDateTime.now());
        adminUser.setRoles(List.of(adminRole));
        userRepository.save(adminUser);

        normalUser = new UserEntity();
        normalUser.setUsername("user");
        normalUser.setEmail("user@test.com");
        normalUser.setPassword("password");
        normalUser.setSignupDate(LocalDateTime.now());
        normalUser.setRoles(List.of(userRole));
        userRepository.save(normalUser);

        em.flush();
        em.clear();
    }

    @Test
    void createBoard_createsBoardWithOwnerAndColumns() {
        BoardDto dto =
                boardService.createBoard(
                        new CreateBoardRequest("Board 1", true),
                        adminUser.getUsername()
                );

        em.flush();
        em.clear();

        Board board = boardRepository.findById(dto.id()).orElseThrow();

        assertEquals("Board 1", board.getName());
        assertEquals(3, board.getColumns().size());
        Optional<BoardMember> adminMemberOpt = board.getBoardMembers().stream()
                .filter(m -> m.getUser().getId().equals(adminUser.getId()))
                .findFirst();

        assertTrue(adminMemberOpt.isPresent(), "Admin user should be a board member");
        BoardMember adminMember = adminMemberOpt.get();
        assertEquals(BoardRole.ADMIN, adminMember.getRole(), "Admin user should have role ADMIN");
    }

    @Test
    void addMember_addsUserToBoard() {
        BoardDto dto = boardService.createBoard(new CreateBoardRequest("Board 2", true), adminUser.getUsername());

        boardService.addMember(dto.id(), normalUser.getId(), "EDITOR", adminUser.getUsername());

        em.flush();
        em.clear();

        Board board = boardRepository.findById(dto.id()).orElseThrow();

        assertTrue(board.getBoardMembers().stream().anyMatch(m -> m.getUser().getId().equals(normalUser.getId())));
    }

    @Test
    void removeMember_failsForLastAdmin() {
        BoardDto dto = boardService.createBoard(new CreateBoardRequest("Board 3", true), adminUser.getUsername());

        assertThrows(
                LastAdminException.class,
                () -> boardService.removeMember(
                        dto.id(),
                        adminUser.getId(),
                        adminUser.getUsername()
                )
        );
    }

    @Test
    void updateBoard_shouldSucceed_whenUserIsAdmin() {
        BoardDto boardDto = boardService.createBoard(
                new CreateBoardRequest("Board A", true),
                adminUser.getUsername()
        );

        em.flush();
        em.clear();

        UpdateBoardRequest request = new UpdateBoardRequest("Board A Updated", null);
        boardService.updateBoard(boardDto.id(), request, adminUser.getUsername());

        em.flush();
        em.clear();

        Board updatedBoard = boardRepository.findById(boardDto.id()).orElseThrow();
        assertEquals("Board A Updated", updatedBoard.getName(), "Admin should be able to update board");
    }

    @Test
    void updateBoard_shouldFail_whenUserIsMemberButNotAdmin() {
        BoardDto boardDto = boardService.createBoard(
                new CreateBoardRequest("Board B", true),
                adminUser.getUsername()
        );

        boardService.addMember(boardDto.id(), normalUser.getId(), "EDITOR", adminUser.getUsername());

        em.flush();
        em.clear();

        UpdateBoardRequest request = new UpdateBoardRequest("Board B Updated", null);

        InsufficientBoardRoleException exception = assertThrows(
                InsufficientBoardRoleException.class,
                () -> boardService.updateBoard(boardDto.id(), request, normalUser.getUsername()));

        assertEquals(BoardRole.ADMIN, exception.getRequiredRole(),
                "Member without ADMIN role should not be able to update board");
    }

    @Test
    void getAllBoards_returnsOnlyAccessibleBoards() {
        boardService.createBoard(
                new CreateBoardRequest("Public A", true),
                adminUser.getUsername()
        );

        boardService.createBoard(
                new CreateBoardRequest("Private B", false),
                adminUser.getUsername()
        );

        boardService.createBoard(
                new CreateBoardRequest("User Board (public)", true),
                normalUser.getUsername()
        );

        boardService.createBoard(
                new CreateBoardRequest("User Board (private)", false),
                normalUser.getUsername()
        );

        em.flush();
        em.clear();

        List<?> boards = boardService.getAllBoards(normalUser.getUsername());

        String result = boards.toString();

        assertTrue(result.contains("Public A"));
        assertFalse(result.contains("Private B"));
        assertTrue(result.contains("User Board (public)"));
        assertTrue(result.contains("User Board (private)"));
    }
}
