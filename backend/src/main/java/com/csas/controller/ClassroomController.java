package com.csas.controller;

import com.csas.dto.ClassroomDTO;
import com.csas.dto.SeatDTO;
import com.csas.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping
    public List<ClassroomDTO> getAllClassrooms() {
        return classroomService.getAllClassrooms();
    }

    @GetMapping("/{id}/seats")
    public List<SeatDTO> getSeats(@PathVariable Long id,
                                   @RequestParam(required = false) String studentId) {
        return classroomService.getSeatsForClassroom(id, studentId);
    }
}
