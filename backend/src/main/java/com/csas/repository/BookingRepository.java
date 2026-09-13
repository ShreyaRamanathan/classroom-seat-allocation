package com.csas.repository;

import com.csas.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByStudentStudentIdOrderByBookingDateDesc(String studentId);

    Optional<Booking> findBySeatIdAndStatus(Long seatId, Booking.BookingStatus status);

    Optional<Booking> findByStudentStudentIdAndStatus(String studentId, Booking.BookingStatus status);
}
