const student = session.requireLogin();
const banner = document.getElementById('banner');

if (student) {
  loadBooking();
}

/**
 * Always re-fetches from the backend (never trusts cached sessionStorage data alone),
 * so a page refresh still reflects the true booking state in MySQL.
 */
async function loadBooking() {
  hideBanner(banner);
  try {
    const bookings = await api.getBookingsForStudent(student.studentId);

    const targetId = getTargetBookingId();
    let booking = targetId
      ? bookings.find(b => String(b.bookingId) === String(targetId))
      : bookings.find(b => b.status === 'CONFIRMED');

    if (!booking) booking = bookings[0]; // fall back to most recent (e.g. a just-cancelled one)

    if (!booking) {
      showBanner(banner, 'No booking found for your account yet.', 'error');
      return;
    }

    render(booking);
  } catch (err) {
    showBanner(banner, err.message, 'error');
  }
}

function getTargetBookingId() {
  const viewId = sessionStorage.getItem('csas_view_booking_id');
  if (viewId) return viewId;
  const last = sessionStorage.getItem('csas_last_booking');
  if (last) return JSON.parse(last).bookingId;
  return null;
}

function render(booking) {
  document.getElementById('dName').textContent = booking.studentName;
  document.getElementById('dId').textContent = booking.studentId;
  document.getElementById('dClassroom').textContent = booking.classroomName;
  document.getElementById('dSeat').textContent = booking.seatNumber;
  document.getElementById('dDate').textContent = formatDateTime(booking.bookingDate);

  const statusEl = document.getElementById('dStatus');
  statusEl.textContent = booking.status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled';
  statusEl.style.background = booking.status === 'CONFIRMED' ? 'var(--success-bg)' : 'var(--danger-bg)';
  statusEl.style.color = booking.status === 'CONFIRMED' ? 'var(--success)' : 'var(--danger)';

  const heading = document.querySelector('.success-card h1');
  heading.textContent = booking.status === 'CONFIRMED'
    ? 'Successfully Booked Your Seat!'
    : 'This Booking Was Cancelled';
}

function viewBooking() {
  loadBooking();
}
