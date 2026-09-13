package com.csas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class BookingResponse {
    private Long bookingId;
    private String studentName;
    private String studentId;
    private String classroomName;
    private String seatNumber;
    private String status;
    private LocalDateTime bookingDate;
}
