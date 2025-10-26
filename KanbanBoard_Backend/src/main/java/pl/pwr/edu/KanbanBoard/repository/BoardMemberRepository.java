package pl.pwr.edu.KanbanBoard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.BoardMember;
import pl.pwr.edu.KanbanBoard.model.UserEntity;

import java.util.List;
import java.util.Optional;

public interface BoardMemberRepository extends JpaRepository<BoardMember, Integer> {
    Optional<BoardMember> findByBoardAndUser(Board board, UserEntity user);
    List<BoardMember> findByBoardId(Integer boardId);
    List<BoardMember> findByUser(UserEntity user);
    boolean existsByBoardAndUser(Board board, UserEntity user);
}
