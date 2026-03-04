/* =====================================================
   api.js – All backend fetch calls
   Backend runs at http://localhost:4000
===================================================== */

const API = 'http://localhost:4000/api';

/* ── Token helpers ─────────────────────────────────── */
const Auth = {
  getToken:     ()          => localStorage.getItem('flms_token'),
  getUser:      ()          => JSON.parse(localStorage.getItem('flms_user') || 'null'),
  setSession:   (t, u)      => { localStorage.setItem('flms_token', t); localStorage.setItem('flms_user', JSON.stringify(u)); },
  clearSession: ()          => { localStorage.removeItem('flms_token'); localStorage.removeItem('flms_user'); },
  isLoggedIn:   ()          => !!localStorage.getItem('flms_token'),
};

/* ── Base fetch ────────────────────────────────────── */
async function apiFetch(path, opts = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res  = await fetch(`${API}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

/* ── Auth API ──────────────────────────────────────── */
const AuthAPI = {
  register:       p  => apiFetch('/auth/register',        { method:'POST', body:JSON.stringify(p) }),
  login:          p  => apiFetch('/auth/login',           { method:'POST', body:JSON.stringify(p) }),
  changePassword: p  => apiFetch('/auth/change-password', { method:'PUT',  body:JSON.stringify(p) }),
};

/* ── Leave API ─────────────────────────────────────── */
const LeaveAPI = {
  apply:        p      => apiFetch('/leaves/apply',           { method:'POST', body:JSON.stringify(p) }),
  myLeaves:     ()     => apiFetch('/leaves/my'),
  allLeaves:    params => apiFetch('/leaves/all' + (params ? '?'+new URLSearchParams(params) : '')),
  updateStatus: (id,p) => apiFetch(`/leaves/${id}/status`,   { method:'PUT',  body:JSON.stringify(p) }),
  stats:        ()     => apiFetch('/leaves/stats'),
  emailLogs:    ()     => apiFetch('/leaves/email-logs'),
};

/* ── User API (admin) ──────────────────────────────── */
const UserAPI = {
  all:        ()         => apiFetch('/users'),
  updateRole: (id, role) => apiFetch(`/users/${id}/role`,   { method:'PUT', body:JSON.stringify({ role }) }),
  toggle:     id         => apiFetch(`/users/${id}/toggle`, { method:'PUT' }),
};
