package pl.pwr.edu.KanbanBoard.service.mapper;

import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.board.BoardDto;
import pl.pwr.edu.KanbanBoard.dto.board.BoardMemberDto;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.UserEntity;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class BoardMapper {
    public BoardDto toDto(Board board, UserEntity currentUser) {
        boolean isFavorite = currentUser != null && currentUser.getFavoriteBoards().stream()
                .anyMatch(fav -> fav.getBoard().getId().equals(board.getId()));

        List<BoardMemberDto> members = board.getBoardMembers().stream()
                .map(member -> new BoardMemberDto(
                        member.getUser().getId(),
                        member.getUser().getUsername(),
                        member.getUser().getEmail(),
                        member.getRole()))
                .toList();

        return new BoardDto(
                board.getId(),
                board.getName(),
                board.getIsPublic(),
                board.getCreatedDate(),
                members,
                isFavorite
        );
    }
}
