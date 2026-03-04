/* =====================================================
   admin.js – Admin / HOD Dashboard
   UI matches screenshots exactly
===================================================== */

async function showAdminDashboard() {
  app.innerHTML = `
    <div class="box" style="width:700px;max-width:95vw;">
      <h2>Admin Dashboard</h2>
      <div id="admin-loading" style="color:#777;margin:10px 0;">Loading leave requests...</div>
      <div id="admin-table"></div>
      <br>
      <span class="back-link" onclick="doAdminLogout()">Logout</span>
    </div>`;

  try {
    const leaves = await LeaveAPI.allLeaves({ status: 'Pending' });
    document.getElementById('admin-loading').style.display = 'none';

    if (leaves.length === 0) {
      document.getElementById('admin-table').innerHTML =
        '<p style="color:#28a745;padding:16px 0;font-weight:600;">✅ No pending leave requests.</p>';
      return;
    }

    document.getElementById('admin-table').innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Faculty</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="leaves-body">
          ${leaves.map(l => `
            <tr id="row-${l.id}">
              <td>${l.faculty_name}</td>
              <td>${l.leave_type}</td>
              <td>${fmt(l.from_date)}</td>
              <td>${fmt(l.to_date)}</td>
              <td>
                <button class="approve-btn" onclick="adminAction(${l.id},'Approved')">Approve</button>
                <button class="reject-btn"  onclick="adminAction(${l.id},'Rejected')">Reject</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    document.getElementById('admin-loading').textContent = 'Error: ' + err.message;
  }
}

async function adminAction(id, status) {
  const comment = status === 'Rejected'
    ? prompt('Enter reason for rejection (optional):') || ''
    : '';

  try {
    await LeaveAPI.updateStatus(id, { status, comment });
    toast(`Leave ${status}! Faculty notified by email. 📧`);
    // Remove the row immediately for UX
    const row = document.getElementById('row-' + id);
    if (row) row.remove();
    // If no more rows, reload dashboard
    const tbody = document.getElementById('leaves-body');
    if (tbody && tbody.children.length === 0) {
      setTimeout(showAdminDashboard, 500);
    }
  } catch (err) {
    toast(err.message);
  }
}

function doAdminLogout() {
  Auth.clearSession();
  toast('Logged out');
  setTimeout(showHome, 600);
}
