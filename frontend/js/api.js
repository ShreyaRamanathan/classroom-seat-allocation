// ============================================================
// Shared API + session helpers used by every page.
// Change BASE_URL if your Spring Boot backend runs elsewhere.
// ============================================================

// Change this to your deployed Render URL (e.g. 'https://my-backend.onrender.com')
const RENDER_BACKEND_URL = ''; 
const BASE_URL = RENDER_BACKEND_URL ? `${RENDER_BACKEND_URL}/api` : 'http://localhost:8080/api';

/**
 * Wraps fetch, parses JSON, and throws a plain Error with the backend's
 * message (from GlobalExceptionHandler) so callers can show it directly.
 */
async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch (networkError) {
    throw new Error('Could not reach the server. Is the backend running on port 8080?');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = body?.message || 'Something went wrong. Please try again.';
    throw new Error(message);
  }
  return body;
}

const api = {
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getClassrooms: () => apiRequest('/classrooms'),
  getSeats: (classroomId, studentId) =>
    apiRequest(`/classrooms/${classroomId}/seats?studentId=${encodeURIComponent(studentId || '')}`),
  bookSeat: (data) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getBookingsForStudent: (studentId) => apiRequest(`/bookings/student/${encodeURIComponent(studentId)}`),
  cancelBooking: (id) => apiRequest(`/bookings/${id}`, { method: 'DELETE' })
};

// ---------- Session (per-tab, cleared on logout) ----------
const session = {
  save(student) {
    sessionStorage.setItem('csas_student', JSON.stringify(student));
  },
  get() {
    const raw = sessionStorage.getItem('csas_student');
    return raw ? JSON.parse(raw) : null;
  },
  clear() {
    sessionStorage.removeItem('csas_student');
    sessionStorage.removeItem('csas_selected_classroom');
    sessionStorage.removeItem('csas_last_booking');
  },
  requireLogin() {
    const student = this.get();
    if (!student) {
      window.location.href = 'login.html';
      return null;
    }
    return student;
  }
};

function logout() {
  session.clear();
  window.location.href = 'login.html';
}

function showBanner(el, message, type = 'error') {
  el.textContent = message;
  el.className = `banner show banner-${type}`;
}

function hideBanner(el) {
  el.className = 'banner';
}

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
