package com.csas.service;

import com.csas.config.ApiException;
import com.csas.dto.BookingRequest;
import com.csas.dto.BookingResponse;
import com.csas.entity.Booking;
import com.csas.entity.Seat;
import com.csas.entity.Student;
import com.csas.repository.BookingRepository;
import com.csas.repository.SeatRepository;
import com.csas.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final StudentRepository studentRepository;

    /**
     * Creates a booking for a seat. Uses a pessimistic write lock on the seat row so that if two
     * requests race for the same seat, the second one to reach this method blocks until the first
     * transaction commits, then correctly sees the seat as OCCUPIED and is rejected.
     */
    @Transactional
    public BookingResponse bookSeat(BookingRequest request) {
        Student student = studentRepository.findByStudentId(request.getStudentId())
                .orElseThrow(() -> new ApiException("Student not found. Please log in again.", HttpStatus.UNAUTHORIZED));

        // One active booking per student, matching the dashboard's single "selected seat" concept.
        bookingRepository.findByStudentStudentIdAndStatus(student.getStudentId(), Booking.BookingStatus.CONFIRMED)
                .ifPresent(existing -> {
                    throw new ApiException("You already have a seat booked. Cancel it before booking another.", HttpStatus.CONFLICT);
                });

        Seat seat = seatRepository.findByIdForUpdate(request.getSeatId())
                .orElseThrow(() -> new ApiException("Please select a seat.", HttpStatus.NOT_FOUND));

        if (seat.getStatus() == Seat.SeatStatus.OCCUPIED) {
            throw new ApiException("This seat is already occupied.", HttpStatus.CONFLICT);
        }
        if (seat.getStatus() == Seat.SeatStatus.DISABLED) {
            throw new ApiException("This seat is unavailable.", HttpStatus.CONFLICT);
        }

        seat.setStatus(Seat.SeatStatus.OCCUPIED);
        seatRepository.save(seat);

        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setSeat(seat);
        booking.setClassroom(seat.getClassroom());
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForStudent(String studentId) {
        return bookingRepository.findByStudentStudentIdOrderByBookingDateDesc(studentId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found.", HttpStatus.NOT_FOUND));

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new ApiException("This booking is already cancelled.", HttpStatus.CONFLICT);
        }

        Seat seat = seatRepository.findByIdForUpdate(booking.getSeat().getId())
                .orElseThrow(() -> new ApiException("Seat not found.", HttpStatus.NOT_FOUND));

        seat.setStatus(Seat.SeatStatus.AVAILABLE);
        seatRepository.save(seat);

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getStudent().getStudentName(),
                booking.getStudent().getStudentId(),
                booking.getClassroom().getClassroomName(),
                booking.getSeat().getSeatNumber(),
                booking.getStatus().name(),
                booking.getBookingDate()
        );
    }
}
