package pl.pwr.edu.KanbanBoard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.pwr.edu.KanbanBoard.model.Task;
import pl.pwr.edu.KanbanBoard.model.TimeEntry;
import pl.pwr.edu.KanbanBoard.model.UserEntity;

import java.time.LocalDate;
import java.util.List;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Integer> {
    List<TimeEntry> findByTaskId(Integer taskId);
    List<TimeEntry> findByTaskIdAndEntryDateBetween(Integer taskId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT DISTINCT te.user FROM TimeEntry te " +
            "JOIN te.task t " +
            "JOIN t.column c " +
            "WHERE c.board.id = :boardId")
    List<UserEntity> findUsersWithEntriesByBoard(@Param("boardId") Integer boardId);
}
