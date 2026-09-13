# Classroom Seat Allocation System

A full prototype: Java Spring Boot + MySQL backend, plain HTML/CSS/JS frontend.

```
classroom-seat-allocation/
│
├── frontend/
│   ├── index.html            entry point (redirects login/dashboard)
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── seat-selection.html
│   ├── confirmation.html
│   ├── css/style.css
│   └── js/
│       ├── api.js            fetch wrapper + session helpers
│       ├── login.js
│       ├── register.js
│       ├── dashboard.js
│       ├── seats.js
│       └── confirmation.js
│
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/csas/
│       │   ├── ClassroomSeatAllocationApplication.java
│       │   ├── config/       SecurityConfig, CorsConfig, ApiException, GlobalExceptionHandler
│       │   ├── controller/   AuthController, ClassroomController, BookingController
│       │   ├── service/      AuthService, ClassroomService, BookingService
│       │   ├── repository/   StudentRepository, ClassroomRepository, SeatRepository, BookingRepository
│       │   ├── entity/       Student, Classroom, Seat, Booking
│       │   └── dto/          request/response objects
│       └── resources/application.properties
│
└── database/
    └── schema.sql            CREATE DATABASE + tables + sample data
```

## Ports
- **Backend (Spring Boot):** `http://localhost:8080`
- **Frontend:** any static file server, e.g. `http://localhost:5500` — see step 6
- **MySQL:** `localhost:3306`

Frontend calls the backend at `http://localhost:8080/api` (set in `frontend/js/api.js`, `BASE_URL`). CORS is already open for local dev in `CorsConfig.java`.

---

## Setup Instructions

### 1. Install Java
Install **JDK 17+**.
- Windows/macOS: download from https://adoptium.net (Temurin 17)
- Linux: `sudo apt install openjdk-17-jdk`

Verify: `java -version`

### 2. Install MySQL
Install **MySQL 8.x** (e.g. MySQL Community Server / MySQL Workbench, or via XAMPP).
Verify: `mysql --version`

### 3. Create the database
```bash
mysql -u root -p < database/schema.sql
```
This creates the `classroom_seat_allocation` database, all four tables, and sample data:
- 3 students (all with password `password123`)
- 2 classrooms (25-seat CS Lab, 30-seat Lecture Hall)
- Seats with a realistic mix of available/occupied/disabled
- 2 sample bookings

### 4. Configure `application.properties`
Open `backend/src/main/resources/application.properties` and set your MySQL credentials:
```properties
spring.datasource.username=root
spring.datasource.password=root      <-- change to your MySQL password
```

### 5. Run the Spring Boot backend
```bash
cd backend
mvn spring-boot:run
```
(No Maven installed? Use the wrapper if present, or install Maven: https://maven.apache.org/install.html)

The API is live once you see `Started ClassroomSeatAllocationApplication` — test it:
```bash
curl http://localhost:8080/api/classrooms
```

### 6. Run the frontend
The frontend is static HTML/CSS/JS — serve the `frontend/` folder with any local server:
```bash
cd frontend
python -m http.server 5500
```
Then open **http://localhost:5500/login.html** in your browser.

(Opening `login.html` directly via `file://` also works in most browsers, but a local server avoids CORS/fetch quirks.)

### 7. Test login
Use a seeded account:
- Student Name: `Ananya Sharma`
- Student ID: `CS2024001`
- Password: `password123`

Or click **Create an account** to register a new student.

### 8. Test seat selection
From the dashboard, click **Choose Your Seat** on a classroom. Click any **green** seat — it turns blue and a confirmation panel appears ("You have selected Seat B3"). Try clicking a **red** (occupied) seat — nothing happens, it's disabled.

### 9. Test booking
Click **Confirm Seat**. You're taken to the success page with your booking details. Go back to the dashboard — the seat now shows in a "Your Selected Seat" card. Try booking a second seat with the same account — the backend rejects it ("You already have a seat booked...").

Open the same classroom in a second browser tab (or another logged-in student) and try booking the seat you just took — you'll get **"This seat is already occupied."**

### 10. Check the booking data in MySQL
```sql
USE classroom_seat_allocation;
SELECT * FROM bookings;
SELECT * FROM seats WHERE status = 'OCCUPIED';
```

Refresh the confirmation or dashboard page at any point — both always re-fetch from the backend, so the booking state you see is always what's actually in MySQL.

---

## API Reference

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | `{studentName, studentId, password}` → creates a student |
| POST | `/api/auth/login` | `{studentName, studentId, password}` → authenticates (BCrypt) |
| GET | `/api/classrooms` | List classrooms with live available/occupied counts |
| GET | `/api/classrooms/{id}/seats?studentId=` | Seat layout + status for one classroom |
| POST | `/api/bookings` | `{seatId, studentId}` → books a seat (pessimistic-locked, race-safe) |
| GET | `/api/bookings/student/{studentId}` | A student's booking history |
| DELETE | `/api/bookings/{id}` | Cancels a booking, frees the seat |

## Notes on design decisions
- **Double-booking prevention:** `SeatRepository.findByIdForUpdate` takes a `PESSIMISTIC_WRITE` row lock inside `BookingService.bookSeat`, so two simultaneous requests for the same seat are serialized — the second always sees `OCCUPIED` and is rejected, not just a client-side check.
- **Passwords:** hashed with BCrypt (`spring-boot-starter-security`'s `BCryptPasswordEncoder`), never stored in plain text.
- **One active seat per student:** enforced in `BookingService` — matches the dashboard's single "Selected Seat" concept. Cancel your current booking to pick a different seat.
- **Schema management:** `ddl-auto=validate` — the SQL script is the source of truth for the schema; Hibernate just checks the entities match it. Switch to `update` in `application.properties` if you'd rather let Hibernate manage tables itself.
