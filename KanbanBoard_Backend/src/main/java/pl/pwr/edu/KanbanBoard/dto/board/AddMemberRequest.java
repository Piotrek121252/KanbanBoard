package pl.pwr.edu.KanbanBoard.dto.board;

import pl.pwr.edu.KanbanBoard.model.BoardRole;

public record AddMemberRequest(
        Integer userId,
        BoardRole role
) {}
