package pl.pwr.edu.KanbanBoard.service.mapper;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.task.TaskDto;
import pl.pwr.edu.KanbanBoard.model.Task;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TaskMapper implements Function<Task, TaskDto> {

    @Override
    public TaskDto apply(Task task) {
        return new TaskDto(
                task.getId(),
                task.getPosition(),
                task.getColumn().getId(),
                task.getName(),
                task.getDescription(),
                task.getIsActive(),
                task.getCreatedDate(),
                task.getDueDate()
        );
    }

    public List<TaskDto> toDtoList(List<Task> tasks) {
        return tasks.stream().map(this::apply).collect(Collectors.toList());
    }
}
