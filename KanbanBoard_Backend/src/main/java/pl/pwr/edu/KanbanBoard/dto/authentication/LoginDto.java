package pl.pwr.edu.KanbanBoard.dto.authentication;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginDto {
    private String username;
    private String password;
}
