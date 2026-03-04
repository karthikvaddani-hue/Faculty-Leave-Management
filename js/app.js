/* =====================================================
   app.js – Home page + shared utilities
===================================================== */

const app = document.getElementById('app');

/* ── Toast ─────────────────────────────────────────── */
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
}

/* ── Button loading state ──────────────────────────── */
function setLoading(btn, on) {
  if (!btn) return;
  if (on)  { btn.dataset.txt = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span> Please wait...'; btn.disabled = true; }
  else     { btn.innerHTML = btn.dataset.txt || 'Submit'; btn.disabled = false; }
}

/* ── Format date ───────────────────────────────────── */
function fmt(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()}`;
}

/* ── Home Page ─────────────────────────────────────── */
function showHome() {
  Auth.clearSession();
  app.innerHTML = `
    <div class="container">
      <h1>Faculty Management System</h1>
      <p>Leave Management &amp; Approval Portal</p>
      <button class="btn-yellow" onclick="showFacultyLogin()">Faculty Login</button>
      <button class="btn-yellow" onclick="showAdminLogin()">Admin Login</button>
    </div>`;
}

/* ── On page load ──────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const user = Auth.getUser();
  if (Auth.isLoggedIn() && user) {
    if (user.role === 'faculty') showFacultyDashboard();
    else showAdminDashboard();
  } else {
    showHome();
  }
});
