package pl.pwr.edu.KanbanBoard.dto.board;

import pl.pwr.edu.KanbanBoard.model.BoardRole;

public record BoardMemberDto(
   Integer userId,
   String username,
   String email,
   BoardRole boardRole
) {}
