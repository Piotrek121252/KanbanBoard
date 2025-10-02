package pl.pwr.edu.KanbanBoard.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "roles")
public class Role {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer Id;

    private String name;
}
