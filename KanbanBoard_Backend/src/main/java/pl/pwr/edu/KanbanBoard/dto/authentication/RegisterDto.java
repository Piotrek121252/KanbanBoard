package pl.pwr.edu.KanbanBoard.dto.authentication;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterDto {
    private String username;
    private String password;
    private String confirmPassword;
    private String email;
}
