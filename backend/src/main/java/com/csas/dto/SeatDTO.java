package com.csas.dto;

import com.csas.entity.Seat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SeatDTO {
    private Long id;
    private String seatNumber;
    private Seat.SeatStatus status;
    private String bookedByStudentId; // populated only so the UI can show "your seat" highlighting; null otherwise
}
