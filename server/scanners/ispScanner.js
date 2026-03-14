/**
 * ISP / WAN Scanner — Ping + Latency monitoring
 * Checks reachability, packet loss, and round-trip time
 */
const { exec } = require('child_process');

function ping(ip, count = 4) {
    return new Promise(resolve => {
        const cmd = process.platform === 'win32'
            ? `ping -n ${count} -w 2000 ${ip}`
            : `ping -c ${count} -W 2 ${ip}`;
        exec(cmd, (err, stdout) => {
            const lines = stdout || '';
            // Parse Windows ping output
            const lostMatch  = lines.match(/Lost = (\d+)/);
            const avgMatch   = lines.match(/Average = (\d+)ms/);
            // Parse Linux ping output
            const lossMatch2 = lines.match(/(\d+)% packet loss/);
            const avgMatch2  = lines.match(/rtt min\/avg\/max.*= [\d.]+\/([\d.]+)/);

            const loss = lostMatch ? parseInt(lostMatch[1]) : (lossMatch2 ? parseInt(lossMatch2[1]) : null);
            const avg  = avgMatch  ? parseInt(avgMatch[1])  : (avgMatch2  ? parseFloat(avgMatch2[1]) : null);
            const reachable = !err && (loss !== null ? loss < count : true);

            resolve({ reachable, packetLoss: loss, avgLatencyMs: avg, raw: lines });
        });
    });
}

async function scan(device) {
    const target = device.ip;
    const result = await ping(target);

    let status = 'Unknown';
    let quality = 'Unknown';

    if (!result.reachable) {
        status = 'Unreachable';
        quality = 'Critical';
    } else {
        status = 'Reachable';
        const lat = result.avgLatencyMs;
        if (lat === null)         quality = 'Good';
        else if (lat < 20)        quality = 'Excellent (<20ms)';
        else if (lat < 50)        quality = 'Good (20-50ms)';
        else if (lat < 100)       quality = 'Acceptable (50-100ms)';
        else if (lat < 200)       quality = 'Poor (100-200ms)';
        else                      quality = 'Critical (>200ms)';
    }

    return {
        deviceType: 'ISP / WAN Link',
        uptime: result.reachable ? 'Responsive' : 'Down',
        firewall: {
            status: result.reachable ? 'Reachable' : 'Unreachable',
            details: `Latency: ${result.avgLatencyMs ?? 'N/A'}ms | Packet Loss: ${result.packetLoss ?? 'N/A'}%`,
            openPorts: 0,
        },
        access: { failedLogins: 0, recentLogins: 'N/A' },
        patching: { status: 'N/A', pendingUpdates: 0 },
        backup: { status: 'N/A', lastBackup: 'N/A' },
        resources: {
            diskUsedPercent: 'N/A',
            memTotal: 0,
            cpuLoad: 'N/A',
        },
        wan: {
            reachable: result.reachable,
            packetLoss: result.packetLoss,
            avgLatencyMs: result.avgLatencyMs,
            quality,
            status,
        }
    };
}

module.exports = { scan };
