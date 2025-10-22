package pl.pwr.edu.KanbanBoard.service.mapper;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.column.ColumnDto;
import pl.pwr.edu.KanbanBoard.model.ColumnEntity;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ColumnMapper implements Function<ColumnEntity, ColumnDto> {

    @Override
    public ColumnDto apply(ColumnEntity column) {
        return new ColumnDto(
                column.getId(),
                column.getBoard().getId(),
                column.getName(),
                column.getPosition(),
                column.getColor()
        );
    }

    public List<ColumnDto> toDtoList(List<ColumnEntity> columns) {
        return columns.stream()
                .map(this::apply)
                .collect(Collectors.toList());
    }
}
