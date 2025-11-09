package pl.pwr.edu.KanbanBoard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.pwr.edu.KanbanBoard.model.Task;
import pl.pwr.edu.KanbanBoard.model.TimeEntry;
import pl.pwr.edu.KanbanBoard.model.UserEntity;

import java.time.LocalDate;
import java.util.List;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Integer> {
    List<TimeEntry> findByTaskId(Integer taskId);
    List<TimeEntry> findByTaskIdAndEntryDateBetween(Integer taskId, LocalDate startDate, LocalDate endDate);
}
