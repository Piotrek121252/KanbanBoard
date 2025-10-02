package pl.pwr.edu.KanbanBoard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.edu.KanbanBoard.model.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {
}
