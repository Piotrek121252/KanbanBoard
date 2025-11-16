package pl.pwr.edu.KanbanBoard.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserFavoriteBoardId implements Serializable {

    private Integer userId;
    private Integer boardId;

    public UserFavoriteBoardId() {}

    public UserFavoriteBoardId(Integer userId, Integer boardId) {
        this.userId = userId;
        this.boardId = boardId;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserFavoriteBoardId)) return false;
        UserFavoriteBoardId that = (UserFavoriteBoardId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(boardId, that.boardId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, boardId);
    }
}

