package com.csas.repository;

import com.csas.entity.Seat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByClassroomIdOrderBySeatNumberAsc(Long classroomId);

    long countByClassroomIdAndStatus(Long classroomId, Seat.SeatStatus status);

    /**
     * Pessimistic write lock on the seat row so two simultaneous booking requests
     * for the same seat cannot both pass the "is it available" check.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Seat s where s.id = :id")
    Optional<Seat> findByIdForUpdate(@Param("id") Long id);
}
