package com.csas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"classroom_id", "seat_number"})
})
@Getter
@Setter
@NoArgsConstructor
public class Seat {

    public enum SeatStatus {
        AVAILABLE,
        OCCUPIED,
        DISABLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SeatStatus status = SeatStatus.AVAILABLE;

    /** Optimistic-lock guard used together with a pessimistic read in booking to prevent double-booking. */
    @Version
    @Column(name = "version")
    private Long version;

    public Seat(String seatNumber, Classroom classroom, SeatStatus status) {
        this.seatNumber = seatNumber;
        this.classroom = classroom;
        this.status = status;
    }
}
