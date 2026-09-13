package com.csas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ClassroomDTO {
    private Long id;
    private String classroomName;
    private Integer totalSeats;
    private Integer rowsCount;
    private Integer colsCount;
    private long availableSeats;
    private long occupiedSeats;
}
