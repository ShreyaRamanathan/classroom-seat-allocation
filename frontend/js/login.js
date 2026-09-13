// Redirect straight to the dashboard if already logged in.
if (session.get()) {
  window.location.href = 'dashboard.html';
}

const form = document.getElementById('loginForm');
const banner = document.getElementById('banner');
const submitBtn = document.getElementById('submitBtn');

const fields = {
  studentName: document.getElementById('field-name'),
  studentId: document.getElementById('field-id'),
  password: document.getElementById('field-password')
};

function clearErrors() {
  Object.values(fields).forEach(f => f.classList.remove('has-error'));
  hideBanner(banner);
}

function validate() {
  clearErrors();
  const name = document.getElementById('studentName').value.trim();
  const id = document.getElementById('studentId').value.trim();
  const pwd = document.getElementById('password').value;

  let valid = true;
  if (!name) { fields.studentName.classList.add('has-error'); valid = false; }
  if (!id) { fields.studentId.classList.add('has-error'); valid = false; }
  if (!pwd) { fields.password.classList.add('has-error'); valid = false; }
  return valid ? { studentName: name, studentId: id, password: pwd } : null;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = validate();
  if (!data) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing In...';

  try {
    const student = await api.login(data);
    session.save(student);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showBanner(banner, err.message || 'Invalid login credentials.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});
