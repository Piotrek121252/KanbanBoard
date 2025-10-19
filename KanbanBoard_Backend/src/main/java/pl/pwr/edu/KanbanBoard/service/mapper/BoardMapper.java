package pl.pwr.edu.KanbanBoard.service.mapper;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.board.BoardDto;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.UserEntity;

import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BoardMapper implements Function<Board, BoardDto> {
    @Override
    public BoardDto apply(Board board) {
        return new BoardDto(
                board.getId(),
                board.getName(),
                board.getIsPublic(),
                board.getCreatedDate(),
                board.getMembers().stream().map(UserEntity::getId).collect(Collectors.toList())
        );
    }
}
