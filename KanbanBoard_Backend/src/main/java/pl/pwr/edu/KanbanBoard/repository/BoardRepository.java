package pl.pwr.edu.KanbanBoard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.pwr.edu.KanbanBoard.model.Board;

@Repository
public interface BoardRepository extends JpaRepository<Board, Integer> {
}
