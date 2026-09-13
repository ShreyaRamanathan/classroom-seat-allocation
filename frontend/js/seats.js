const student = session.requireLogin();
const classroomId = sessionStorage.getItem('csas_selected_classroom');

const banner = document.getElementById('banner');
const seatGridEl = document.getElementById('seatGrid');
const confirmPanel = document.getElementById('confirmPanel');
const cpSeatText = document.getElementById('cpSeatText');
const confirmBtn = document.getElementById('confirmBtn');

let selectedSeatEl = null;
let selectedSeatId = null;

if (!classroomId) {
  window.location.href = 'dashboard.html';
} else if (student) {
  init();
}

async function init() {
  try {
    const [classrooms, seats] = await Promise.all([
      api.getClassrooms(),
      api.getSeats(classroomId, student.studentId)
    ]);

    const classroom = classrooms.find(c => String(c.id) === String(classroomId));
    if (!classroom) {
      showBanner(banner, 'Classroom not found.', 'error');
      return;
    }

    document.getElementById('classroomTitle').textContent = classroom.classroomName;
    document.getElementById('classroomSub').textContent =
      `${classroom.availableSeats} available · ${classroom.occupiedSeats} occupied`;

    renderSeatGrid(seats, classroom.rowsCount, classroom.colsCount);
  } catch (err) {
    seatGridEl.innerHTML = '';
    showBanner(banner, err.message, 'error');
  }
}

function renderSeatGrid(seats, rowsCount, colsCount) {
  const seatByNumber = {};
  seats.forEach(s => { seatByNumber[s.seatNumber] = s; });

  seatGridEl.innerHTML = '';
  seatGridEl.style.gridTemplateColumns = `repeat(1, auto)`;

  for (let r = 0; r < rowsCount; r++) {
    const rowLetter = String.fromCharCode(65 + r); // A, B, C ...
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';

    const labelEl = document.createElement('div');
    labelEl.className = 'seat-row-label';
    labelEl.textContent = rowLetter;
    rowEl.appendChild(labelEl);

    for (let c = 1; c <= colsCount; c++) {
      const seatNumber = `${rowLetter}${c}`;
      const seat = seatByNumber[seatNumber];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = seatNumber;
      btn.dataset.seatNumber = seatNumber;

      if (!seat) {
        btn.className = 'seat seat-disabled';
      } else {
        btn.dataset.seatId = seat.id;
        if (seat.status === 'OCCUPIED') {
          btn.className = 'seat seat-occupied';
          btn.title = 'Already occupied';
        } else if (seat.status === 'DISABLED') {
          btn.className = 'seat seat-disabled';
          btn.title = 'Unavailable';
        } else {
          btn.className = 'seat seat-available';
          btn.title = 'Available — click to select';
          btn.addEventListener('click', () => selectSeat(btn, seat));
        }
      }
      rowEl.appendChild(btn);
    }
    seatGridEl.appendChild(rowEl);
  }
}

function selectSeat(el, seat) {
  if (selectedSeatEl) {
    selectedSeatEl.classList.remove('seat-selected');
    selectedSeatEl.classList.add('seat-available');
  }
  el.classList.remove('seat-available');
  el.classList.add('seat-selected');

  selectedSeatEl = el;
  selectedSeatId = seat.id;

  cpSeatText.textContent = `You have selected Seat ${seat.seatNumber}`;
  confirmPanel.classList.add('show');
  hideBanner(banner);
}

function changeSeat() {
  if (selectedSeatEl) {
    selectedSeatEl.classList.remove('seat-selected');
    selectedSeatEl.classList.add('seat-available');
  }
  selectedSeatEl = null;
  selectedSeatId = null;
  confirmPanel.classList.remove('show');
}

async function confirmSeat() {
  if (!selectedSeatId) {
    showBanner(banner, 'Please select a seat.', 'error');
    return;
  }

  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Booking...';

  try {
    const booking = await api.bookSeat({ seatId: selectedSeatId, studentId: student.studentId });
    sessionStorage.setItem('csas_last_booking', JSON.stringify(booking));
    window.location.href = 'confirmation.html';
  } catch (err) {
    showBanner(banner, err.message, 'error');
    // The seat may have just been taken by someone else — refresh the grid to reflect reality.
    await init();
    confirmPanel.classList.remove('show');
    selectedSeatEl = null;
    selectedSeatId = null;
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Seat';
  }
}
