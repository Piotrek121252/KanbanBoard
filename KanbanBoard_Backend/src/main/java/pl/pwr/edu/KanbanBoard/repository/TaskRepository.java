package pl.pwr.edu.KanbanBoard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.pwr.edu.KanbanBoard.model.Task;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByColumnIdOrderByCreatedDateAsc(Integer columnId);

    List<Task> findByColumnIdOrderByPositionDesc(Integer columnId);

    List<Task> findByColumnIdOrderByPositionAsc(Integer columnId);
}
