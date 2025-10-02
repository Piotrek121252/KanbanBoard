package pl.pwr.edu.KanbanBoard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime signUpDate;
}
