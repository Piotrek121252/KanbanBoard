package pl.pwr.edu.KanbanBoard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;

@Repository
public interface ColumnRepository extends JpaRepository<ColumnEntity, Integer> {
}
