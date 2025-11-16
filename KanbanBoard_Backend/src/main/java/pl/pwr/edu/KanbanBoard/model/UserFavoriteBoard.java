package pl.pwr.edu.KanbanBoard.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "user_favorite_boards")
public class UserFavoriteBoard {

    @EmbeddedId
    private UserFavoriteBoardId id;

    @ManyToOne
    @MapsId("userId")
    private UserEntity user;

    @ManyToOne
    @MapsId("boardId")
    private Board board;
}
