/* =====================================================
   faculty.js – Faculty Dashboard pages
   UI matches screenshots exactly
===================================================== */

/* ── Faculty Dashboard ─────────────────────────────── */
function showFacultyDashboard() {
  app.innerHTML = `
    <div class="menu">
      <h2>Faculty Dashboard</h2>
      <a href="#" onclick="showApplyLeave()">Apply Leave</a>
      <a href="#" onclick="showLeaveStatus()">Leave Status</a>
      <a href="#" onclick="showLeaveHistory()">Leave History</a>
      <a href="#" onclick="doLogout()">Logout</a>
    </div>`;
}

function doLogout() {
  Auth.clearSession();
  toast('Logged out successfully');
  setTimeout(showHome, 600);
}

/* ── Apply Leave ───────────────────────────────────── */
function showApplyLeave() {
  const today = new Date().toISOString().split('T')[0];
  app.innerHTML = `
    <div class="box">
      <h2>Apply Leave</h2>
      <select id="leave-type">
        <option value="Casual Leave">Casual Leave</option>
        <option value="Medical Leave">Medical Leave</option>
        <option value="On Duty">On Duty</option>
        <option value="Earned Leave">Earned Leave</option>
        <option value="Maternity Leave">Maternity Leave</option>
      </select>
      <input type="date" id="from-date" min="${today}">
      <input type="date" id="to-date"   min="${today}">
      <textarea id="reason" placeholder="Reason"></textarea>
      <button id="apply-btn" onclick="doApplyLeave()">Submit</button>
      <br>
      <span class="back-link" onclick="showFacultyDashboard()">Back</span>
    </div>`;
}

async function doApplyLeave() {
  const leave_type = document.getElementById('leave-type').value;
  const from_date  = document.getElementById('from-date').value;
  const to_date    = document.getElementById('to-date').value;
  const reason     = document.getElementById('reason').value.trim();

  if (!from_date || !to_date || !reason) { toast('Please fill all fields'); return; }
  if (new Date(from_date) > new Date(to_date)) { toast('From date must be before To date'); return; }

  const btn = document.getElementById('apply-btn');
  setLoading(btn, true);
  try {
    await LeaveAPI.apply({ leave_type, from_date, to_date, reason });
    toast('Leave Applied Successfully');
    setTimeout(showFacultyDashboard, 1200);
  } catch (err) {
    toast(err.message);
    setLoading(btn, false);
  }
}

/* ── Leave Status ──────────────────────────────────── */
async function showLeaveStatus() {
  app.innerHTML = `
    <div class="box">
      <h2>Leave Status</h2>
      <p id="ls-loading" style="color:#777;margin:10px 0;">Loading...</p>
      <div id="ls-table"></div>
      <br>
      <span class="back-link" onclick="showFacultyDashboard()">Back</span>
    </div>`;

  try {
    const leaves = await LeaveAPI.myLeaves();
    document.getElementById('ls-loading').style.display = 'none';

    if (leaves.length === 0) {
      document.getElementById('ls-table').innerHTML = '<p style="color:#777;padding:10px 0;">No leave applications yet.</p>';
      return;
    }

    // Show only pending leaves in status page (matching screenshot)
    const pending = leaves.filter(l => l.status === 'Pending');
    if (pending.length === 0) {
      document.getElementById('ls-table').innerHTML = '<p style="color:#28a745;padding:10px 0;">No pending leaves.</p>';
      return;
    }

    document.getElementById('ls-table').innerHTML = `
      <table>
        <thead>
          <tr><th>Leave</th><th>Dates</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${pending.map(l => `
            <tr>
              <td>${l.leave_type}</td>
              <td>${fmt(l.from_date)} to ${fmt(l.to_date)}</td>
              <td class="pending">Pending</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    document.getElementById('ls-loading').textContent = 'Error: ' + err.message;
  }
}

/* ── Leave History ─────────────────────────────────── */
async function showLeaveHistory() {
  app.innerHTML = `
    <div class="box">
      <h2>Leave History</h2>
      <p id="lh-loading" style="color:#777;margin:10px 0;">Loading...</p>
      <div id="lh-table"></div>
      <br>
      <span class="back-link" onclick="showFacultyDashboard()">Back</span>
    </div>`;

  try {
    const leaves = await LeaveAPI.myLeaves();
    document.getElementById('lh-loading').style.display = 'none';

    if (leaves.length === 0) {
      document.getElementById('lh-table').innerHTML = '<p style="color:#777;padding:10px 0;">No leave history found.</p>';
      return;
    }

    document.getElementById('lh-table').innerHTML = `
      <table>
        <thead>
          <tr><th>Leave</th><th>Dates</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${leaves.map(l => `
            <tr>
              <td>${l.leave_type}</td>
              <td>${fmt(l.from_date)} to ${fmt(l.to_date)}</td>
              <td class="${l.status.toLowerCase()}">${l.status}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    document.getElementById('lh-loading').textContent = 'Error: ' + err.message;
  }
}
