if (session.get()) {
  window.location.href = 'dashboard.html';
}

const form = document.getElementById('registerForm');
const banner = document.getElementById('banner');
const submitBtn = document.getElementById('submitBtn');

const fields = {
  studentName: document.getElementById('field-name'),
  studentId: document.getElementById('field-id'),
  password: document.getElementById('field-password'),
  confirmPassword: document.getElementById('field-confirm')
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
  const confirm = document.getElementById('confirmPassword').value;

  let valid = true;
  if (!name) { fields.studentName.classList.add('has-error'); valid = false; }
  if (!id) { fields.studentId.classList.add('has-error'); valid = false; }
  if (!pwd || pwd.length < 4) { fields.password.classList.add('has-error'); valid = false; }
  if (pwd !== confirm) { fields.confirmPassword.classList.add('has-error'); valid = false; }

  return valid ? { studentName: name, studentId: id, password: pwd } : null;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = validate();
  if (!data) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  try {
    const student = await api.register(data);
    session.save(student);
    window.location.href = 'dashboard.html';
  } catch (err) {
    showBanner(banner, err.message || 'Could not create account.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});
