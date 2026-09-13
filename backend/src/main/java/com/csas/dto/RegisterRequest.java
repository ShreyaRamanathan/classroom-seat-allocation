package com.csas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Student name is required.")
    private String studentName;

    @NotBlank(message = "Student ID is required.")
    private String studentId;

    @NotBlank(message = "Password is required.")
    private String password;
}
