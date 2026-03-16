const path    = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const fs        = require('fs');
const cron      = require('node-cron');

const app = express();

// ── Security Headers ──────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // disabled to let the React app load inline scripts
}));

// ── CORS — only allow same origin in production ───────────────
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : [];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (same-host / curl / PM2 health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

app.use(express.json());

// ── Rate Limiters ─────────────────────────────────────────────
const scanLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many scan requests. Please wait a minute and try again.' },
});
const reportLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many report requests. Please wait 5 minutes and try again.' },
});

const PORT = parseInt(process.env.PORT) || 3001;
const DEVICES_FILE = path.join(__dirname, 'devices.json');

// =============================================================
//  SCANNER ROUTER — dispatch by device type
// =============================================================
const linuxScanner   = require('./scanners/linuxScanner');
const snmpScanner    = require('./scanners/snmpScanner');
const windowsScanner = require('./scanners/windowsScanner');
const apiScanner     = require('./scanners/apiScanner');
const ispScanner     = require('./scanners/ispScanner');

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, '../dist')));

function getScanner(type) {
    switch (type) {
        case 'linux':     return linuxScanner;
        case 'snmp':      return snmpScanner;
        case 'windows':
        case 'macos':     return windowsScanner;
        case 'fortinet':
        case 'paloalto':  return apiScanner;
        case 'isp':
        case 'wan':       return ispScanner;
        // Legacy support
        case 'ubuntusrv': return linuxScanner;
        case 'cisco':     return snmpScanner;
        default:          return ispScanner; // fallback: just ping
    }
}

// =============================================================
//  CHECKLIST & REPORTER
// =============================================================
const { buildChecklist } = require('./checklist');
const { sendReport, generateCSV } = require('./reporter');

// =============================================================
//  DEVICE STORE HELPERS
// =============================================================
function loadDevices() {
    try {
        return JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function saveDevices(devices) {
    fs.writeFileSync(DEVICES_FILE, JSON.stringify(devices, null, 2));
}

const HISTORY_FILE = path.join(__dirname, 'history.json');

function appendHistory(newScans) {
    try {
        let history = [];
        if (fs.existsSync(HISTORY_FILE)) {
            history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        }
        history.push(...newScans);
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (e) {
        console.error('Failed to save to history:', e.message);
    }
}

// =============================================================
//  SCAN ONE DEVICE
// =============================================================
async function scanDevice(device) {
    const scanner = getScanner(device.type);
    try {
        const result = await scanner.scan(device);
        return { device, result, error: null };
    } catch (err) {
        console.error(`[SCAN] ${device.name} failed:`, err.message);
        return { device, result: null, error: err.message };
    }
}

// =============================================================
//  API: DEVICE CRUD
// =============================================================

// GET all devices (without exposing passwords)
app.get('/api/devices', (req, res) => {
    const devices = loadDevices().map(d => ({
        ...d,
        auth: {
            ...d.auth,
            password: d.auth?.password ? '••••••' : '',
            apiToken: d.auth?.apiToken ? '••••••' : '',
        }
    }));
    res.json(devices);
});

// POST add a new device
app.post('/api/devices', (req, res) => {
    const devices = loadDevices();
    const newDevice = {
        id: `device-${Date.now()}`,
        name: req.body.name || 'New Device',
        type: req.body.type || 'linux',
        ip:   req.body.ip,
        port: req.body.port || null,
        auth: req.body.auth || {},
        lastScan: null,
        lastScanError: null,
        status: 'idle',
        addedAt: new Date().toISOString(),
    };
    devices.push(newDevice);
    saveDevices(devices);
    res.json({ success: true, device: newDevice });
});

// PUT update a device
app.put('/api/devices/:id', (req, res) => {
    let devices = loadDevices();
    const idx = devices.findIndex(d => d.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Device not found' });
    devices[idx] = { ...devices[idx], ...req.body, id: devices[idx].id };
    saveDevices(devices);
    res.json({ success: true, device: devices[idx] });
});

// DELETE a device
app.delete('/api/devices/:id', (req, res) => {
    let devices = loadDevices();
    devices = devices.filter(d => d.id !== req.params.id);
    saveDevices(devices);
    res.json({ success: true });
});

// =============================================================
//  API: SCAN SINGLE DEVICE
// =============================================================
app.post('/api/devices/:id/scan', scanLimiter, async (req, res) => {
    const devices = loadDevices();
    const device = devices.find(d => d.id === req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    console.log(`[SCAN] Starting scan for ${device.name} (${device.type} @ ${device.ip})`);
    const { result, error } = await scanDevice(device);

    // Persist last scan result
    const idx = devices.findIndex(d => d.id === device.id);
    devices[idx].lastScan = result;
    devices[idx].lastScanError = error;
    devices[idx].lastScanAt = new Date().toISOString();
    saveDevices(devices);
    
    appendHistory([{
        deviceId: device.id,
        timestamp: devices[idx].lastScanAt,
        scanType: 'manual_single',
        result,
        error
    }]);

    if (error) return res.status(500).json({ error });
    res.json(result);
});

// =============================================================
//  API: SCAN ALL DEVICES → return merged checklist
// =============================================================
app.post('/api/devices/scan-all', scanLimiter, async (req, res) => {
    const devices = loadDevices();
    console.log(`[SCAN-ALL] Scanning ${devices.length} devices...`);

    const results = await Promise.all(devices.map(scanDevice));

    const timestamp = new Date().toISOString();
    const updatedDevices = devices.map((d, i) => ({
        ...d,
        lastScan: results[i].result,
        lastScanError: results[i].error,
        lastScanAt: timestamp,
    }));
    saveDevices(updatedDevices);

    appendHistory(results.map((r, i) => ({
        deviceId: r.device.id,
        timestamp,
        scanType: 'bulk_scan',
        result: r.result,
        error: r.error
    })));

    // Build merged checklist
    const checklist = buildChecklist(results);
    const scanDate  = new Date().toLocaleString('en-IN');

    res.json({
        scanDate,
        devicesScanned: devices.length,
        devicesOnline: results.filter(r => !r.error).length,
        checklist,
        deviceSummaries: results.map(r => ({
            id: r.device.id,
            name: r.device.name,
            type: r.device.type,
            ip: r.device.ip,
            error: r.error || null,
            uptime: r.result?.uptime || null,
        }))
    });
});

// =============================================================
//  API: SEND REPORT NOW (manual trigger)
// =============================================================
app.post('/api/send-report', reportLimiter, async (req, res) => {
    try {
        const devices = loadDevices();
        console.log('[REPORT] Manual report triggered...');

        const results = await Promise.all(devices.map(scanDevice));

        const timestamp = new Date().toISOString();
        const updatedDevices = devices.map((d, i) => ({
            ...d,
            lastScan: results[i].result,
            lastScanError: results[i].error,
            lastScanAt: timestamp,
        }));
        saveDevices(updatedDevices);

        appendHistory(results.map((r, i) => ({
            deviceId: r.device.id,
            timestamp,
            scanType: 'manual_report',
            result: r.result,
            error: r.error
        })));

        const checklist = buildChecklist(results);
        const scanDate  = new Date().toLocaleString('en-IN');
        const settings  = loadSettings();

        const emailResult = await sendReport(checklist, updatedDevices, scanDate, settings.recipients);
        res.json({
            success: true,
            message: emailResult.sent
                ? `Report emailed to: ${emailResult.recipients}`
                : `Report generated (email not sent: ${emailResult.reason})`,
            scanDate,
            checklistSummary: {
                total: checklist.length,
                completed: checklist.filter(t => t.completed).length,
            }
        });
    } catch (err) {
        console.error('[REPORT] Failed:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// =============================================================
//  API: FETCH HISTORY
// =============================================================
app.get('/api/history', (req, res) => {
    try {
        if (!fs.existsSync(HISTORY_FILE)) return res.json([]);
        const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        res.json(history);
    } catch (e) {
        res.status(500).json({ error: 'Failed to read history' });
    }
});

// =============================================================
//  API: RUN CUSTOM SCRIPT ON DEVICE (via SSH)
// =============================================================
app.post('/api/run-script', async (req, res) => {
    const { deviceId, command } = req.body;
    if (!deviceId || !command) return res.status(400).json({ error: 'deviceId and command required' });

    const devices = loadDevices();
    const device = devices.find(d => d.id === deviceId);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    if (device.type === 'windows') {
        return res.status(400).json({ error: `Direct script execution via SSH is not supported on Windows devices out-of-the-box in this demo. Please use the PS script locally.` });
    }

    const { NodeSSH } = require('node-ssh');
    const ssh = new NodeSSH();
    try {
        await ssh.connect({
            host: device.ip,
            port: parseInt(device.port) || 22,
            username: device.auth?.username,
            password: device.auth?.password,
            readyTimeout: 10000,
        });
        const result = await ssh.execCommand(command, { cwd: '/tmp' });
        ssh.dispose();
        res.json({
            stdout: result.stdout || '',
            stderr: result.stderr || '',
            exitCode: result.code ?? 0,
        });
    } catch (err) {
        try { ssh.dispose(); } catch(_) {}
        res.status(500).json({ error: `SSH connection failed: ${err.message}` });
    }
});

// =============================================================
//  API: TEST EMAIL CONNECTION
// =============================================================
app.post('/api/test-email', async (req, res) => {
    const nodemailer = require('nodemailer');
    const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS) return res.status(400).json({ error: 'EMAIL_USER and EMAIL_PASS not set in .env' });

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(EMAIL_PORT) || 587,
        secure: EMAIL_SECURE === 'true',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        tls: { rejectUnauthorized: false }
    });
    try {
        await transporter.verify();
        res.json({ success: true, message: `SMTP connection verified for ${EMAIL_USER}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================================
//  API: Legacy scan endpoint (for backwards compatibility)
// =============================================================
app.post('/api/scan', async (req, res) => {
    const { type, credentials } = req.body;
    const tempDevice = {
        id: 'temp',
        name: credentials?.name || 'Temp Device',
        type: type || 'linux',
        ip: credentials?.ip,
        port: type === 'snmp' ? 161 : 22,
        auth: {
            username: credentials?.username,
            password: credentials?.password,
            community: credentials?.community || 'public',
        }
    };

    const timestamp = new Date().toLocaleString('en-IN');
    console.log(`[${timestamp}] Legacy scan for ${type} @ ${credentials?.ip}`);

    const { result, error } = await scanDevice(tempDevice);
    if (error) return res.status(500).json({ error, details: error });

    // Shape response to match old format for frontend compatibility
    res.json({
        timestamp,
        device: { type, ip: credentials?.ip, name: credentials?.name, uptime: result.uptime },
        modules: {
            firewall: { status: result.firewall?.status, logs_analyzed: 100, critical_events: result.firewall?.openPorts || 0 },
            vpn: { status: result.access ? 'Active' : 'N/A', active_tunnels: 1, failed_logins: result.access?.failedLogins || 0, notes: result.access?.recentLogins || '' },
            patching: { status: result.patching?.status, missing_critical: result.patching?.pendingUpdates || 0, notes: '' },
            backup: { status: result.backup?.status, last_backup: result.backup?.lastBackup, integrity_check: 'N/A' },
        }
    });
});

// =============================================================
//  API: BUILD CHECKLIST FROM STORED RESULTS (no re-scan)
// =============================================================
app.get('/api/checklist', (req, res) => {
    const devices = loadDevices();
    // Use stored lastScan data — no scanning needed
    const results = devices.map(d => ({
        device: d,
        result: d.lastScan || null,
        error: d.lastScanError || null
    }));
    const checklist = buildChecklist(results);
    const scanDate = devices.reduce((latest, d) => {
        if (!d.lastScanAt) return latest;
        return !latest || d.lastScanAt > latest ? d.lastScanAt : latest;
    }, null);
    res.json({
        checklist,
        total: checklist.length,
        completed: checklist.filter(t => t.completed).length,
        devicesScanned: devices.length,
        devicesOnline: devices.filter(d => d.lastScan && !d.lastScanError).length,
        scanDate: scanDate ? new Date(scanDate).toLocaleString('en-IN') : 'Never',
    });
});

// =============================================================
//  API: CLEAR CHECKLIST DATA
// =============================================================
app.post('/api/checklist/clear', (req, res) => {
    let devices = loadDevices();
    devices = devices.map(d => ({ ...d, lastScan: null, lastScanError: null, lastScanAt: null }));
    saveDevices(devices);
    res.json({ message: 'Checklist cleared' });
});

// =============================================================
//  DYNAMIC CRON JOB (Auto-Scanner)
// =============================================================
let currentCron = null;
let lastScheduledScanMinute = null; // Guard against double-triggers in same minute
const PID = process.pid;

// =============================================================
//  API: SETTINGS (Auto-Scanner Schedule)
// =============================================================
const settingsPath = path.join(__dirname, 'settings.json');
function loadSettings() {
    if (fs.existsSync(settingsPath)) {
        const data = JSON.parse(fs.readFileSync(settingsPath));
        if (!data.recipients) data.recipients = []; // Ensure recipients array exists
        return data;
    }
    return { autoScanSchedule: 'off', autoEmail: false, recipients: [] };
}
function saveSettings(s) { fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2)); }

function getNextCronTime(freq) {
    const now = new Date();
    const next = new Date(now);
    if (freq === '15min') {
        const mins = now.getMinutes();
        const nextMins = Math.ceil((mins + 1) / 15) * 15;
        next.setMinutes(nextMins, 0, 0);
        if (nextMins >= 60) { next.setHours(now.getHours() + 1); next.setMinutes(nextMins - 60, 0, 0); }
    } else if (freq === 'hourly') {
        next.setHours(now.getHours() + 1, 0, 0, 0);
    } else if (freq === 'daily') {
        next.setDate(now.getDate() + 1); next.setHours(8, 0, 0, 0);
    } else if (freq === 'weekly') {
        const daysUntilMon = (8 - now.getDay()) % 7 || 7;
        next.setDate(now.getDate() + daysUntilMon); next.setHours(8, 0, 0, 0);
    } else return null;
    return next.toISOString();
}

app.get('/api/settings', (req, res) => {
    const s = loadSettings();
    const devices = loadDevices();
    const lastScanAt = devices.reduce((latest, d) => {
        if (!d.lastScanAt) return latest;
        return !latest || d.lastScanAt > latest ? d.lastScanAt : latest;
    }, null);
    
    res.json({ 
        ...s, 
        nextScanAt: getNextCronTime(s.autoScanSchedule),
        lastScanAt: lastScanAt ? new Date(lastScanAt).toLocaleString('en-IN') : null
    });
});

app.post('/api/settings', (req, res) => {
    const s = { ...loadSettings(), ...req.body };
    saveSettings(s);
    applySchedule();
    res.json({ message: 'Settings updated', nextScanAt: getNextCronTime(s.autoScanSchedule) });
});

const runScheduledScan = async () => {
    const now = new Date();
    const currentMinute = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
    
    if (lastScheduledScanMinute === currentMinute) {
        console.log(`[CRON][PID:${PID}] Skipping scan — already triggered for ${currentMinute}`);
        return;
    }
    
    lastScheduledScanMinute = currentMinute;
    console.log(`[CRON][PID:${PID}] Starting scheduled security scan... (${now.toLocaleString('en-IN')})`);
    try {
        const devices = loadDevices();
        if (devices.length === 0) { console.log('[CRON] No devices configured. Skipping.'); return; }

        const results = await Promise.all(devices.map(scanDevice));
        const timestamp = new Date().toISOString();
        const updatedDevices = devices.map((d, i) => ({
            ...d, lastScan: results[i].result, lastScanError: results[i].error, lastScanAt: timestamp
        }));
        saveDevices(updatedDevices);
        appendHistory(results.map((r) => ({
            deviceId: r.device.id, timestamp, scanType: 'auto', result: r.result, error: r.error
        })));

        const settings = loadSettings();
        if (settings.autoEmail !== false) {
            const checklist = buildChecklist(results);
            const scanDate = new Date().toLocaleString('en-IN');
            await sendReport(checklist, updatedDevices, scanDate, settings.recipients);
            console.log('[CRON] Auto-email report sent.');
        }
        console.log('[CRON] Scheduled scan completed successfully.');
    } catch (e) {
        console.error('[CRON] Error during scheduled scan:', e.message);
    }
};

const applySchedule = () => {
    if (currentCron) {
        currentCron.stop();
        currentCron = null;
    }
    const freq = loadSettings().autoScanSchedule;
    if (freq === 'off') {
        console.log('⏰ Auto-scanner schedule: OFF');
        return;
    }
    
    let exp;
    if (freq === '15min') exp = '*/15 * * * *';
    else if (freq === 'hourly') exp = '0 * * * *';
    else if (freq === 'daily') exp = '0 8 * * *'; // 8 AM every day
    else exp = '0 8 * * 1'; // 8 AM every Monday (weekly)
    
    currentCron = cron.schedule(exp, runScheduledScan, { timezone: 'Asia/Kolkata' });
    console.log(`⏰ [PID:${PID}] Auto-scanner schedule set to: ${freq} (${exp})`);
};

// Initialize schedule on startup
applySchedule();

// ─── HEALTH CHECK ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), pid: process.pid, timestamp: new Date().toISOString() });
});

// ─── SPA CATCH-ALL (Express v5: named wildcard required) ─────
// Serve the React app for any non-API route
app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// =============================================================
//  GLOBAL ERROR HANDLER (Prevents HTML stack traces)
// =============================================================
app.use((err, req, res, next) => {
    console.error(`[CRITICAL ERROR] ${req.method} ${req.url}:`, err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// =============================================================
//  SERVER START
// =============================================================
const server = app.listen(PORT, '0.0.0.0', () => {
    const devCount = loadDevices().length;
    console.log(`\n🛡️  [PID:${PID}] SecOps Security Backend — http://localhost:${PORT}`);
    console.log(`📡  ${devCount} device(s) registered in device registry`);
    console.log(`📧  Email: ${process.env.EMAIL_USER ? '✓ Configured' : '✗ Not configured (fill server/.env)'}`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`\n[CRITICAL ERROR] Port ${PORT} is already in use by another instance!`);
        console.error(`Please kill all Node processes before restarting.`);
        process.exit(1);
    } else {
        console.error('[CRITICAL ERROR] Server failed to start:', e);
        process.exit(1);
    }
});

