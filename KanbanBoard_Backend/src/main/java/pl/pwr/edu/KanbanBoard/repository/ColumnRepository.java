package pl.pwr.edu.KanbanBoard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.pwr.edu.KanbanBoard.model.Board;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;

import java.util.List;

@Repository
public interface ColumnRepository extends JpaRepository<ColumnEntity, Integer> {
    List<ColumnEntity> findByBoardOrderByPosition(Board board);
}
