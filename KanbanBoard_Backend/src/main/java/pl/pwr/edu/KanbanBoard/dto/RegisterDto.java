package pl.pwr.edu.KanbanBoard.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterDto {
    private String username;
    private String password;
    private String email;
}
