/**
 * Reporter — CSV generation + HTML email template
 */
const nodemailer = require('nodemailer');

function getTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false },
    });
}

function generateCSV(checklistTasks, devices, scanDate) {
    const headers = ['ID', 'Category', 'Priority', 'Task', 'Completed', 'Auto-Filled', 'Notes', 'Source Devices', 'Scan Date'];
    const rows = checklistTasks.map(t => [
        t.id,
        `"${(t.cat || t.category || '').replace(/"/g, '""')}"`,
        t.pri || t.priority || '',
        `"${(t.title || '').replace(/"/g, '""')}"`,
        t.completed ? 'Yes' : 'No',
        t.autoFill ? 'Yes' : 'No',
        `"${(t.notes || '').replace(/"/g, '""').replace(/\n/g, ' | ')}"`,
        `"${(t.sources || []).join(', ')}"`,
        `"${scanDate}"`,
    ].join(','));
    return [headers.join(','), ...rows].join('\r\n');
}

function generateHTML(checklistTasks, devices, scanDate) {
    const total = checklistTasks.length;
    const completed = checklistTasks.filter(t => t.completed).length;
    const pending = total - completed;
    const pct = Math.round((completed / total) * 100);

    const failedLogins = devices.reduce((acc, d) => acc + (d.lastScan?.access?.failedLogins || 0), 0);
    const reachable = devices.filter(d => d.lastScan && !d.lastScanError).length;

    const statusColor = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';

    // Device rows — explicitly extract fields to avoid undefined rendering
    const deviceRows = devices.map(d => {
        const name = String(d.name || d.id || 'Unknown Device');
        const type = String(d.type || '—').toUpperCase();
        const ip   = String(d.ip || '—');
        const status = d.lastScanError ? `⚠ ${d.lastScanError}` : '✓ Online';
        const statusC = d.lastScanError ? '#dc2626' : '#16a34a';
        return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;font-weight:500;">${name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">${type}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;font-family:monospace;">${ip}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:${statusC};font-weight:600;">${status}</td>
        </tr>`;
    }).join('');

    // Category summary rows
    const cats = {};
    checklistTasks.forEach(t => {
        const c = t.cat || t.category || 'Uncategorised';
        if (!cats[c]) cats[c] = { total: 0, done: 0 };
        cats[c].total++;
        if (t.completed) cats[c].done++;
    });
    const catRows = Object.entries(cats).map(([cat, s]) => {
        const catPct = Math.round((s.done / s.total) * 100);
        const c = s.done === s.total ? '#16a34a' : s.done > 0 ? '#d97706' : '#dc2626';
        return `
        <tr>
          <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;">${cat}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:${c};font-weight:600;">${s.done}/${s.total}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:${c};">${catPct}%</td>
        </tr>`;
    }).join('');

    // Top incomplete tasks
    const topPending = checklistTasks.filter(t => !t.completed).slice(0, 5);
    const pendingRows = topPending.map(t => {
        const priC = t.pri === 'High' || t.priority === 'High' ? '#dc2626' : t.pri === 'Medium' || t.priority === 'Medium' ? '#d97706' : '#6b7280';
        return `
        <tr>
          <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;">${t.title}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:${priC};font-weight:600;">${t.pri || t.priority || '—'}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">${t.cat || t.category || '—'}</td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
<tr><td align="center">
<table width="680" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2d1b69 100%);padding:32px 36px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">🛡️ SecOps Security Operations</div>
          <div style="font-size:13px;color:#a5b4fc;margin-top:6px;">Security Checklist Report — ${scanDate}</div>
        </td>
        <td align="right" valign="top">
          <div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:10px 18px;display:inline-block;text-align:center;">
            <div style="font-size:32px;font-weight:800;color:${statusColor === '#16a34a' ? '#4ade80' : statusColor === '#d97706' ? '#fbbf24' : '#f87171'};">${pct}%</div>
            <div style="font-size:11px;color:#c4b5fd;">Complete</div>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- KPI Cards -->
  <tr><td style="padding:24px 36px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="23%" align="center" style="background:#f0fdf4;border-radius:8px;padding:16px 8px;border:1px solid #bbf7d0;">
          <div style="font-size:26px;font-weight:700;color:#16a34a;">${completed}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">Tasks Completed</div>
        </td>
        <td width="4%"></td>
        <td width="23%" align="center" style="background:#fff7ed;border-radius:8px;padding:16px 8px;border:1px solid #fed7aa;">
          <div style="font-size:26px;font-weight:700;color:#d97706;">${pending}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">Pending Review</div>
        </td>
        <td width="4%"></td>
        <td width="23%" align="center" style="background:#eff6ff;border-radius:8px;padding:16px 8px;border:1px solid #bfdbfe;">
          <div style="font-size:26px;font-weight:700;color:#2563eb;">${reachable}/${devices.length}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">Devices Online</div>
        </td>
        <td width="4%"></td>
        <td width="23%" align="center" style="background:${failedLogins > 100 ? '#fef2f2' : '#f0fdf4'};border-radius:8px;padding:16px 8px;border:1px solid ${failedLogins > 100 ? '#fecaca' : '#bbf7d0'};">
          <div style="font-size:26px;font-weight:700;color:${failedLogins > 100 ? '#dc2626' : '#16a34a'};">${failedLogins}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">Failed Logins</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Devices Table -->
  <tr><td style="padding:24px 36px 0;">
    <div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:12px;border-left:4px solid #6366f1;padding-left:10px;">📡 Devices Scanned (${reachable}/${devices.length} online)</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;border-collapse:collapse;">
      <tr style="background:#f8fafc;">
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:0.5px;">Device Name</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;">Type</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;">IP Address</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;">Status</th>
      </tr>
      ${deviceRows}
    </table>
  </td></tr>

  <!-- Checklist by Category -->
  <tr><td style="padding:24px 36px 0;">
    <div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:12px;border-left:4px solid #6366f1;padding-left:10px;">📋 Checklist by Category</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;border-collapse:collapse;">
      <tr style="background:#f8fafc;">
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;">Category</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;">Completed</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;">Progress</th>
      </tr>
      ${catRows}
    </table>
  </td></tr>

  <!-- Top Pending Actions -->
  ${topPending.length > 0 ? `
  <tr><td style="padding:24px 36px 0;">
    <div style="font-size:15px;font-weight:700;color:#1e293b;margin-bottom:12px;border-left:4px solid #f59e0b;padding-left:10px;">⚠️ Top Pending Actions Requiring Review</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;border-collapse:collapse;">
      <tr style="background:#f8fafc;">
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;">Task</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;">Priority</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;">Category</th>
      </tr>
      ${pendingRows}
    </table>
  </td></tr>` : ''}

  <!-- Footer -->
  <tr><td style="padding:24px 36px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border-left:4px solid #6366f1;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:12px;color:#64748b;line-height:1.6;">
          📎 The complete checklist with all <strong>${total} tasks</strong> is attached as a CSV file.<br>
          ✋ <strong>Action required:</strong> Please review all <strong style="color:#d97706;">${pending} pending tasks</strong> manually.<br>
          🔒 This is an automated report from <strong>SecOps Security Operations Center</strong>.
        </div>
      </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

async function sendReport(checklistTasks, devices, scanDate, customRecipients = []) {
    const transporter = getTransporter();
    if (!transporter) {
        console.warn('[REPORTER] Email not configured — skipping send.');
        return { sent: false, reason: 'Email not configured in .env' };
    }

    const csvContent = generateCSV(checklistTasks, devices, scanDate);
    const htmlContent = generateHTML(checklistTasks, devices, scanDate);

    // Prefer UI-configured custom recipients. Fallback to .env defaults if none configured.
    let rawRecipients = [];
    if (customRecipients && customRecipients.length > 0) {
        rawRecipients = customRecipients.map(r => r.email).filter(Boolean);
    } else {
        rawRecipients = [
            process.env.CEO_EMAIL,
            process.env.IT_HEAD_EMAIL
        ].filter(Boolean);
    }
    
    // Deduplicate emails using a Set (prevents receiving twice if same email is used for both)
    const recipients = [...new Set(rawRecipients)].join(', ');

    if (!recipients) {
        return { sent: false, reason: 'No recipient emails configured (set CEO_EMAIL / IT_HEAD_EMAIL in .env)' };
    }

    const dateShort = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const completed = checklistTasks.filter(t => t.completed).length;
    const pct = Math.round((completed / checklistTasks.length) * 100);

    await transporter.sendMail({
        from: `"SecOps | Security Operations" <${process.env.EMAIL_USER}>`,
        to: recipients,
        subject: `🛡️ Security Report — ${dateShort} | ${pct}% Complete | ${devices.length} Device(s)`,
        html: htmlContent,
        attachments: [{
            filename: `security_report_${new Date().toISOString().slice(0, 10)}.csv`,
            content: csvContent,
            contentType: 'text/csv',
        }],
    });

    console.log(`[REPORTER] Report sent to: ${recipients}`);
    return { sent: true, recipients, scanDate };
}

module.exports = { generateCSV, generateHTML, sendReport };
