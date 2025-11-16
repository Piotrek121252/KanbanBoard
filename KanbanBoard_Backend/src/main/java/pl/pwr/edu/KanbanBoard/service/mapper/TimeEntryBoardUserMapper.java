package pl.pwr.edu.KanbanBoard.service.mapper;

import org.springframework.stereotype.Service;
import pl.pwr.edu.KanbanBoard.dto.timeEntry.TimeEntryBoardUserDto;
import pl.pwr.edu.KanbanBoard.model.UserEntity;

@Service
public class TimeEntryBoardUserMapper {

    public TimeEntryBoardUserDto toDto(UserEntity user, boolean isCurrentMember) {
        return new TimeEntryBoardUserDto(
                user.getId(),
                user.getUsername(),
                isCurrentMember
        );
    }
}