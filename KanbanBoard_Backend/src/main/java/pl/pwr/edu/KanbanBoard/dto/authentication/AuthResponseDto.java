package pl.pwr.edu.KanbanBoard.dto.authentication;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthResponseDto {
    private String accessToken;
    private String tokenType;
    private String error;

    public AuthResponseDto(String accessToken, String tokenType) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
    }

    public AuthResponseDto(String error) {
        this.error = error;
    }


}
