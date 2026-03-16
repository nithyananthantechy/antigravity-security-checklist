/**
 * Linux Server Scanner — SSH
 * Collects: uptime, failed logins, firewall (UFW), patches, disk, open ports, users
 */
const { Client } = require('ssh2');

function runSSH(config, command) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const timer = setTimeout(() => { conn.end(); reject(new Error('SSH timeout')); }, 15000);
        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) { clearTimeout(timer); return reject(err); }
                let out = '';
                stream.on('close', () => { clearTimeout(timer); conn.end(); resolve(out.trim()); })
                      .on('data', c => { out += c; })
                      .stderr.on('data', () => {});
            });
        }).on('error', e => { clearTimeout(timer); reject(e); }).connect(config);
    });
}

async function safe(fn) {
    try { return await fn(); } catch (e) { return ''; }
}

async function scan(device) {
    const cfg = {
        host: device.ip, port: device.port || 22,
        username: device.auth.username, password: device.auth.password,
        readyTimeout: 10000
    };

    // Run all checks in parallel
    const [uptime, kernelVer, updates, failedLogins, ufwStatus, diskUsage, openPorts, lastLogins, cpuLoad, memInfo] = await Promise.all([
        safe(() => runSSH(cfg, 'uptime -p')),
        safe(() => runSSH(cfg, 'uname -r')),
        safe(() => runSSH(cfg, 'apt list --upgradable 2>/dev/null | grep -c ""')),
        safe(() => runSSH(cfg, 'cat /var/log/auth.log /var/log/syslog 2>/dev/null | grep -E "Failed password|action=\\"login\\" status=\\"failed\\"" | wc -l')),
        safe(() => runSSH(cfg, 'sudo -n ufw status 2>/dev/null | head -3')),
        safe(() => runSSH(cfg, 'df -h / | tail -1')),
        safe(() => runSSH(cfg, 'ss -tuln 2>/dev/null | grep LISTEN | wc -l')),
        safe(() => runSSH(cfg, 'last -n 5 2>/dev/null | head -5')),
        safe(() => runSSH(cfg, 'cat /proc/loadavg 2>/dev/null')),
        safe(() => runSSH(cfg, 'free -m 2>/dev/null | grep Mem')),
    ]);

    const updatesCount = parseInt(updates) || 0;
    const failedCount = parseInt(failedLogins) || 0;
    const portsCount = parseInt(openPorts) || 0;
    const memParts  = memInfo.split(/\s+/);
    const memTotal  = parseInt(memParts[1]) || 0;
    const memUsed   = parseInt(memParts[2]) || 0;
    const diskPct   = diskUsage.match(/(\d+)%/)?.[1] || 'N/A';

    return {
        deviceType: 'Linux Server',
        uptime: uptime || 'Unknown',
        kernelVersion: kernelVer || 'Unknown',
        firewall: {
            status: ufwStatus.includes('active') ? 'Active' : 'Inactive',
            details: ufwStatus || 'Could not read UFW status (may need sudo)',
            openPorts: portsCount,
        },
        access: {
            failedLogins: failedCount,
            recentLogins: lastLogins,
        },
        patching: {
            status: updatesCount > 0 ? 'Updates Available' : 'Compliant',
            pendingUpdates: updatesCount,
        },
        backup: { status: 'Requires manual check', lastBackup: 'N/A' },
        resources: {
            diskUsedPercent: diskPct,
            memTotal, memUsed,
            loadAvg: (cpuLoad || '').split(' ').slice(0, 3).join(', '),
        },
        raw: { uptime, failedLogins, ufwStatus, diskUsage, openPorts, lastLogins }
    };
}

module.exports = { scan };
