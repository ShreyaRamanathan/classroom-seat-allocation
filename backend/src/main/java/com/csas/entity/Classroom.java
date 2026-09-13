package com.csas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "classrooms")
@Getter
@Setter
@NoArgsConstructor
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "classroom_name", nullable = false, length = 100)
    private String classroomName;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    /** Number of seat rows (A, B, C ...) used to render the grid. */
    @Column(name = "rows_count", nullable = false)
    private Integer rowsCount;

    /** Number of seat columns (1, 2, 3 ...) used to render the grid. */
    @Column(name = "cols_count", nullable = false)
    private Integer colsCount;

    public Classroom(String classroomName, Integer totalSeats, Integer rowsCount, Integer colsCount) {
        this.classroomName = classroomName;
        this.totalSeats = totalSeats;
        this.rowsCount = rowsCount;
        this.colsCount = colsCount;
    }
}
