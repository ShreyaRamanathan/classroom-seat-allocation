package com.csas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingRequest {

    @NotNull(message = "Please select a seat.")
    private Long seatId;

    @NotNull(message = "Student ID is required.")
    private String studentId;
}
