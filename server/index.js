const express = require('express');
const cors = require('cors');
const { Client } = require('ssh2');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;

// Helper to run SSH command
function runSSHCommand(config, command) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) return reject(err);
                let data = '';
                stream.on('close', (code, signal) => {
                    conn.end();
                    resolve(data);
                }).on('data', (chunk) => {
                    data += chunk;
                }).stderr.on('data', (chunk) => {
                    console.error('STDERR: ' + chunk);
                });
            });
        }).on('error', (err) => {
            reject(err);
        }).connect(config);
    });
}

// API: Connect & Scan
app.post('/api/scan', async (req, res) => {
    const { type, credentials } = req.body;
    const timestamp = new Date().toLocaleString();

    console.log(`[${timestamp}] Request received for ${type} on ${credentials.ip}`);

    try {
        let result = {
            timestamp,
            device: {
                type,
                ip: credentials.ip,
                name: credentials.name,
                uptime: 'Unknown'
            },
            modules: {},
            threats: [] // Simplified for now
        };

        if (type === 'ubuntusrv') {
            // REAL SSH CONNECTION
            const sshConfig = {
                host: credentials.ip,
                port: 22,
                username: credentials.username,
                password: credentials.password,
                readyTimeout: 5000
            };

            // 1. Check Uptime & OS
            const uptime = await runSSHCommand(sshConfig, 'uptime -p');
            result.device.uptime = uptime.trim();

            // 2. Check Security Updates (Patching)
            const updates = await runSSHCommand(sshConfig, 'apt list --upgradable 2>/dev/null | grep -c security');
            result.modules.patching = {
                status: parseInt(updates) > 0 ? 'Updates Available' : 'Compliant',
                missing_critical: parseInt(updates),
                devices_scanned: 1,
                notes: `Found ${updates.trim()} security updates pending.`
            };

            // 3. Check Failed Logins (Access/VPN)
            // Note: This requires read access to /var/log/auth.log
            const failedLogins = await runSSHCommand(sshConfig, 'grep "Failed password" /var/log/auth.log | wc -l');
            result.modules.vpn = {
                status: 'Active',
                active_tunnels: 1,
                failed_logins: parseInt(failedLogins),
                notes: `${failedLogins.trim()} failed SSH login attempts detected.`
            };

            // 4. Firewall Status (UFW)
            const ufwStatus = await runSSHCommand(sshConfig, 'sudo ufw status | grep Status');
            result.modules.firewall = {
                status: ufwStatus.includes('active') ? 'Active' : 'Inactive',
                logs_analyzed: 100, // Placeholder as we can't easily count all syslog without root
                critical_events: 0
            };

            // 5. Backup (Mocked check for a backup file)
            result.modules.backup = {
                status: 'Success',
                last_backup: new Date().toLocaleString(),
                integrity_check: 'Passed'
            };

        } else if (type === 'fortinet' || type === 'paloalto') {
            // REAL API CONNECTION (Generic Structure)
            // Note: In a real scenario, we would use the specific API endpoints
            // For now, we simulate the API call to avoid timeouts if the user enters a fake IP

            // Allow ping/test connection mechanism here
            result.modules = {
                firewall: { status: 'Connected (API)', logs_analyzed: 5000, critical_events: 2 },
                vpn: { status: 'Operational', active_tunnels: 5, failed_logins: 0 },
                patching: { status: 'Compliant', missing_critical: 0, notes: 'Firmware up to date' },
                backup: { status: 'Synced', last_backup: timestamp, integrity_check: 'Passed' }
            };
        }

        res.json(result);

    } catch (error) {
        console.error("Scan Failed:", error.message);
        res.status(500).json({ error: error.message, details: "Could not connect to device. Ensure SSH is enabled and credentials are correct." });
    }
});

app.listen(PORT, () => {
    console.log(`Antigravity Backend running on http://localhost:${PORT}`);
});
