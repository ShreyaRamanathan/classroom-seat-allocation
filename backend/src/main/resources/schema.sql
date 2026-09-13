-- ============================================================
-- Classroom Seat Allocation System - Database Schema
-- ============================================================


-- ------------------------------------------------------------
-- students
-- ------------------------------------------------------------
CREATE TABLE students (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_name  VARCHAR(100) NOT NULL,
    student_id    VARCHAR(50)  NOT NULL,
    password      VARCHAR(255) NOT NULL,
    CONSTRAINT uq_students_student_id UNIQUE (student_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- classrooms
-- ------------------------------------------------------------
CREATE TABLE classrooms (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    classroom_name  VARCHAR(100) NOT NULL,
    total_seats     INT NOT NULL,
    rows_count      INT NOT NULL,
    cols_count      INT NOT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- seats
-- ------------------------------------------------------------
CREATE TABLE seats (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    seat_number   VARCHAR(10) NOT NULL,
    classroom_id  BIGINT NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    version       BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_seats_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    CONSTRAINT uq_seats_classroom_seat UNIQUE (classroom_id, seat_number),
    CONSTRAINT chk_seats_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'DISABLED'))
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bookings
-- ------------------------------------------------------------
CREATE TABLE bookings (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id     BIGINT NOT NULL,
    seat_id        BIGINT NOT NULL,
    classroom_id   BIGINT NOT NULL,
    booking_date   DATETIME NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    CONSTRAINT fk_bookings_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_seat FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    CONSTRAINT chk_bookings_status CHECK (status IN ('CONFIRMED', 'CANCELLED'))
) ENGINE=InnoDB;

-- ============================================================
-- Sample data so the prototype can be tested immediately
-- ============================================================

-- Sample students (password for all of them is: password123)
-- Hash below is a real BCrypt hash of "password123" (10 rounds) - verified to
-- match/reject correctly and is compatible with Spring Security's BCryptPasswordEncoder.
INSERT INTO students (student_name, student_id, password) VALUES
('Ananya Sharma', 'CS2024001', '$2b$10$JgbCLm5UiLVFUsJ/6sNH6ebdmjTKt5ehYM2Oa/B7FBsCGHbYlMP7C'),
('Rahul Verma',   'CS2024002', '$2b$10$JgbCLm5UiLVFUsJ/6sNH6ebdmjTKt5ehYM2Oa/B7FBsCGHbYlMP7C'),
('Priya Nair',    'CS2024003', '$2b$10$JgbCLm5UiLVFUsJ/6sNH6ebdmjTKt5ehYM2Oa/B7FBsCGHbYlMP7C');

-- Sample classrooms
INSERT INTO classrooms (classroom_name, total_seats, rows_count, cols_count) VALUES
('CS Lab 101 - Computer Science', 25, 5, 5),
('EEE Lecture Hall 204', 30, 6, 5);

-- Seats for classroom 1 (CS Lab 101): rows A-E, columns 1-5
INSERT INTO seats (seat_number, classroom_id, status) VALUES
('A1', 1, 'AVAILABLE'), ('A2', 1, 'AVAILABLE'), ('A3', 1, 'OCCUPIED'), ('A4', 1, 'AVAILABLE'), ('A5', 1, 'AVAILABLE'),
('B1', 1, 'AVAILABLE'), ('B2', 1, 'OCCUPIED'),  ('B3', 1, 'AVAILABLE'), ('B4', 1, 'AVAILABLE'), ('B5', 1, 'DISABLED'),
('C1', 1, 'AVAILABLE'), ('C2', 1, 'AVAILABLE'), ('C3', 1, 'AVAILABLE'), ('C4', 1, 'AVAILABLE'),  ('C5', 1, 'AVAILABLE'),
('D1', 1, 'AVAILABLE'), ('D2', 1, 'AVAILABLE'), ('D3', 1, 'AVAILABLE'), ('D4', 1, 'AVAILABLE'), ('D5', 1, 'AVAILABLE'),
('E1', 1, 'DISABLED'),  ('E2', 1, 'AVAILABLE'), ('E3', 1, 'AVAILABLE'), ('E4', 1, 'AVAILABLE'), ('E5', 1, 'AVAILABLE');

-- Seats for classroom 2 (EEE Lecture Hall 204): rows A-F, columns 1-5
INSERT INTO seats (seat_number, classroom_id, status)
SELECT CONCAT(r.row_letter, c.col_num), 2, 'AVAILABLE'
FROM (SELECT 'A' AS row_letter UNION SELECT 'B' UNION SELECT 'C' UNION SELECT 'D' UNION SELECT 'E' UNION SELECT 'F') r
CROSS JOIN (SELECT 1 AS col_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) c;

-- A couple of confirmed bookings that match the OCCUPIED seats above,
-- so GET /api/bookings/student/{id} has something to return out of the box.
INSERT INTO bookings (student_id, seat_id, classroom_id, booking_date, status) VALUES
(2, (SELECT id FROM seats WHERE classroom_id = 1 AND seat_number = 'A3'), 1, NOW(), 'CONFIRMED'),
(3, (SELECT id FROM seats WHERE classroom_id = 1 AND seat_number = 'B2'), 1, NOW(), 'CONFIRMED');
