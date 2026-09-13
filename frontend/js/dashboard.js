const student = session.requireLogin();

const banner = document.getElementById('banner');
const classroomListEl = document.getElementById('classroomList');
const bookedSectionEl = document.getElementById('bookedSection');

if (student) {
  document.getElementById('welcomeName').textContent = `Welcome, ${student.studentName}! 👋`;
  document.getElementById('welcomeId').textContent = `Student ID: ${student.studentId}`;
  init();
}

async function init() {
  await Promise.all([loadActiveBooking(), loadClassrooms()]);
}

async function loadActiveBooking() {
  try {
    const bookings = await api.getBookingsForStudent(student.studentId);
    const active = bookings.find(b => b.status === 'CONFIRMED');

    if (active) {
      bookedSectionEl.innerHTML = `
        <div class="booked-card">
          <div class="bc-left">
            <div class="bc-icon">✅</div>
            <div>
              <h4>Your Selected Seat: ${active.seatNumber}</h4>
              <p>${active.classroomName} · Booked ${formatDateTime(active.bookingDate)}</p>
            </div>
          </div>
          <div class="btn-row" style="width:auto;">
            <button class="btn btn-secondary" onclick="viewBooking(${active.bookingId})">View Booking</button>
            <button class="btn btn-danger" onclick="cancelBooking(${active.bookingId})">Cancel</button>
          </div>
        </div>
      `;
    } else {
      bookedSectionEl.innerHTML = '';
    }
  } catch (err) {
    showBanner(banner, err.message, 'error');
  }
}

async function loadClassrooms() {
  try {
    const classrooms = await api.getClassrooms();
    if (!classrooms.length) {
      classroomListEl.innerHTML = '<div class="empty-text">No classrooms available yet.</div>';
      return;
    }
    classroomListEl.innerHTML = classrooms.map(c => `
      <div class="classroom-card">
        <div class="cc-info">
          <h4>${c.classroomName}</h4>
          <div class="cc-meta">
            <span class="dot-available">● ${c.availableSeats} Available</span>
            <span class="dot-occupied">● ${c.occupiedSeats} Occupied</span>
            <span>🪑 ${c.totalSeats} Total Seats</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="chooseSeat(${c.id})">Choose Your Seat</button>
      </div>
    `).join('');
  } catch (err) {
    classroomListEl.innerHTML = '';
    showBanner(banner, err.message, 'error');
  }
}

function chooseSeat(classroomId) {
  sessionStorage.setItem('csas_selected_classroom', classroomId);
  window.location.href = 'seat-selection.html';
}

function viewBooking(bookingId) {
  sessionStorage.setItem('csas_view_booking_id', bookingId);
  window.location.href = 'confirmation.html';
}

async function cancelBooking(bookingId) {
  if (!confirm('Cancel this seat booking?')) return;
  try {
    await api.cancelBooking(bookingId);
    await init();
  } catch (err) {
    showBanner(banner, err.message, 'error');
  }
}
