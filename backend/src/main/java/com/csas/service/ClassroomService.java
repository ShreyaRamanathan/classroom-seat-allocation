package com.csas.service;

import com.csas.config.ApiException;
import com.csas.dto.ClassroomDTO;
import com.csas.dto.SeatDTO;
import com.csas.entity.Booking;
import com.csas.entity.Classroom;
import com.csas.entity.Seat;
import com.csas.repository.BookingRepository;
import com.csas.repository.ClassroomRepository;
import com.csas.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<ClassroomDTO> getAllClassrooms() {
        return classroomRepository.findAll().stream()
                .map(c -> new ClassroomDTO(
                        c.getId(),
                        c.getClassroomName(),
                        c.getTotalSeats(),
                        c.getRowsCount(),
                        c.getColsCount(),
                        seatRepository.countByClassroomIdAndStatus(c.getId(), Seat.SeatStatus.AVAILABLE),
                        seatRepository.countByClassroomIdAndStatus(c.getId(), Seat.SeatStatus.OCCUPIED)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SeatDTO> getSeatsForClassroom(Long classroomId, String requestingStudentId) {
        if (!classroomRepository.existsById(classroomId)) {
            throw new ApiException("Classroom not found.", HttpStatus.NOT_FOUND);
        }

        List<Seat> seats = seatRepository.findByClassroomIdOrderBySeatNumberAsc(classroomId);

        return seats.stream().map(seat -> {
            String bookedBy = null;
            if (seat.getStatus() == Seat.SeatStatus.OCCUPIED) {
                Optional<Booking> booking = bookingRepository.findBySeatIdAndStatus(seat.getId(), Booking.BookingStatus.CONFIRMED);
                if (booking.isPresent() && booking.get().getStudent().getStudentId().equals(requestingStudentId)) {
                    bookedBy = requestingStudentId;
                }
            }
            return new SeatDTO(seat.getId(), seat.getSeatNumber(), seat.getStatus(), bookedBy);
        }).toList();
    }
}
