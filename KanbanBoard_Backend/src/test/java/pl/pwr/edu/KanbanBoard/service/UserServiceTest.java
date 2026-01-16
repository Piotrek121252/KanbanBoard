package pl.pwr.edu.KanbanBoard.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.pwr.edu.KanbanBoard.config.JWTGenerator;
import pl.pwr.edu.KanbanBoard.dto.UserDto;
import pl.pwr.edu.KanbanBoard.dto.authentication.AuthResponseDto;
import pl.pwr.edu.KanbanBoard.dto.authentication.LoginRequestDto;
import pl.pwr.edu.KanbanBoard.dto.authentication.RegisterRequestDto;
import pl.pwr.edu.KanbanBoard.exceptions.customExceptions.BoardNotFoundException;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.BoardMember;
import pl.pwr.edu.KanbanBoard.model.Role;
import pl.pwr.edu.KanbanBoard.model.UserEntity;
import pl.pwr.edu.KanbanBoard.repository.BoardMemberRepository;
import pl.pwr.edu.KanbanBoard.repository.BoardRepository;
import pl.pwr.edu.KanbanBoard.repository.RoleRepository;
import pl.pwr.edu.KanbanBoard.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private BoardRepository boardRepository;
    @Mock private BoardMemberRepository boardMemberRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JWTGenerator jwtGenerator;
    @InjectMocks private UserService userService;

    @Test
    void register_shouldSaveUser_whenDataIsValid() {
        RegisterRequestDto request = new RegisterRequestDto(
                "newuser", "user@example.com", "password123", "password123"
        );
        Role userRole = new Role();
        userRole.setName("USER");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        String result = userService.register(request);

        assertEquals("Użytkownik został utworzony.", result);
        verify(userRepository).save(any(UserEntity.class));
    }

    @Test
    void register_shouldThrow_whenUsernameExists() {
        RegisterRequestDto request = new RegisterRequestDto(
                "existinguser", "user@example.com", "password123", "password123"
        );
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> userService.register(request));
    }

    @Test
    void register_shouldThrow_whenPasswordsDoNotMatch() {
        RegisterRequestDto request = new RegisterRequestDto(
                "newuser", "user@example.com", "password123", "different123"
        );
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> userService.register(request));
    }

    @Test
    void register_shouldThrow_whenEmailInvalidFormat() {
        RegisterRequestDto request = new RegisterRequestDto(
                "newuser", "invalid-email", "password123", "password123"
        );

        assertThrows(IllegalArgumentException.class,
                () -> userService.register(request));
    }

    @Test
    void login_shouldReturnToken_whenAuthenticationSucceeds() {
        LoginRequestDto loginDto = new LoginRequestDto("user", "password");
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any()))
                .thenReturn(auth);
        when(jwtGenerator.generateToken(auth))
                .thenReturn("fake-jwt-token");

        AuthResponseDto response = userService.login(loginDto);

        assertEquals("fake-jwt-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
    }

    @Test
    void login_shouldThrow_whenAuthenticationFails() {
        LoginRequestDto loginDto = new LoginRequestDto("user", "wrongpassword");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class,
                () -> userService.login(loginDto));
    }

    @Test
    void getAllUsers_shouldExcludeMembers_whenExcludeBoardIdProvided() {
        // Users
        UserEntity user1 = new UserEntity();
        user1.setId(1);
        UserEntity user2 = new UserEntity();
        user2.setId(2);
        UserEntity user3 = new UserEntity();
        user3.setId(3);

        when(userRepository.findAll()).thenReturn(List.of(user1, user2, user3));

        // Board members
        BoardMember member = new BoardMember();
        member.setUser(user2); // user2 is a member
        when(boardMemberRepository.findByBoardId(100)).thenReturn(List.of(member));

        List<UserDto> result = userService.getAllUsers(100, ""); // exclude boardId 100

        assertEquals(2, result.size());
        Set<Integer> ids = Set.of(result.get(0).id(), result.get(1).id());
        assertTrue(ids.contains(1));
        assertTrue(ids.contains(3));
    }

    @Test
    void getAllUsers_shouldReturnAllUsers_whenNoFilter() {
        UserEntity user1 = new UserEntity();
        user1.setId(1);
        UserEntity user2 = new UserEntity();
        user2.setId(2);
        UserEntity user3 = new UserEntity();
        user3.setId(3);

        when(userRepository.findAll()).thenReturn(List.of(user1, user2, user3));

        List<UserDto> result = userService.getAllUsers(null, null); // no filters

        assertEquals(3, result.size());
    }

    @Test
    void addFavoriteBoard_shouldAddBoard_whenBoardExists() {
        UserEntity user = new UserEntity();
        user.setId(1);
        user.setFavoriteBoards(new java.util.ArrayList<>());
        Board board = new Board();
        board.setId(42);

        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(boardRepository.findById(42)).thenReturn(Optional.of(board));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        assertDoesNotThrow(() -> userService.addFavoriteBoard("user", 42));
        assertEquals(1, user.getFavoriteBoards().size());
        assertEquals(42, user.getFavoriteBoards().get(0).getBoard().getId());
    }

    @Test
    void addFavoriteBoard_shouldThrow_whenBoardNotFound() {
        UserEntity user = new UserEntity();
        user.setId(1);
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(boardRepository.findById(42)).thenReturn(Optional.empty());

        assertThrows(BoardNotFoundException.class,
                () -> userService.addFavoriteBoard("user", 42));
    }
}
