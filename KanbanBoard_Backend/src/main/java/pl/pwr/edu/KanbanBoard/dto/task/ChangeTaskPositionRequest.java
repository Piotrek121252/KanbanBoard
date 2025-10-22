package pl.pwr.edu.KanbanBoard.dto.task;

import org.springframework.web.bind.annotation.RequestParam;

public record ChangeTaskPositionRequest(
        Integer newColumnId,
        Integer newIndex
) {}
