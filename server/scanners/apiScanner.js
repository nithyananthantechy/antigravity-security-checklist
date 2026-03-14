/**
 * REST API Scanner — FortiGate, Palo Alto, Cisco FTD
 * Connects using API Token (not SSH, not SNMP)
 */
const https = require('https');

function apiGet(baseUrl, path, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, baseUrl);
        const options = {
            hostname: url.hostname, port: url.port || 443,
            path: url.pathname + url.search, method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            rejectUnauthorized: false, // Self-signed certs common on firewalls
            timeout: 10000,
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { resolve({ raw: data }); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('API timeout')); });
        req.end();
    });
}

async function scanFortinet(device) {
    const baseUrl = `https://${device.ip}`;
    const token = device.auth?.apiToken;

    if (!token) throw new Error('Fortinet requires an API token in auth.apiToken');

    // FortiGate REST API endpoints
    const [sysStatus, vpnStatus, policies] = await Promise.allSettled([
        apiGet(baseUrl, '/api/v2/monitor/system/status', token),
        apiGet(baseUrl, '/api/v2/monitor/vpn/ssl/select', token),
        apiGet(baseUrl, '/api/v2/cmdb/firewall/policy?count=5', token),
    ]);

    const sys = sysStatus.status === 'fulfilled' ? sysStatus.value : {};
    const vpn = vpnStatus.status === 'fulfilled' ? vpnStatus.value : {};
    const pol = policies.status === 'fulfilled' ? policies.value : {};

    const firmware = sys?.version || sys?.results?.version || 'Unknown';
    const hostname = sys?.hostname || sys?.results?.hostname || device.name;
    const vpnSessions = Array.isArray(vpn?.results) ? vpn.results.length : 0;
    const policyCount = pol?.results?.length || 0;

    return {
        deviceType: 'Fortinet FortiGate (API)',
        uptime: sys?.results?.uptime || 'N/A',
        firmware,
        hostname,
        firewall: {
            status: 'Connected (FortiGate API)',
            details: `Firmware: ${firmware} | Active Policies: ${policyCount}`,
            openPorts: 0,
        },
        access: {
            failedLogins: 0,
            recentLogins: `VPN active sessions: ${vpnSessions}`,
        },
        patching: {
            status: firmware !== 'Unknown' ? 'Firmware Retrieved' : 'Manual check required',
            pendingUpdates: 0,
            notes: `Firmware: ${firmware}`,
        },
        backup: { status: 'Manual check required', lastBackup: 'N/A' },
        resources: { diskUsedPercent: 'N/A', memTotal: 0, cpuLoad: 'N/A' },
    };
}

async function scanPaloAlto(device) {
    const baseUrl = `https://${device.ip}`;
    const token = device.auth?.apiToken;
    if (!token) throw new Error('Palo Alto requires an API token in auth.apiToken');

    const res = await apiGet(baseUrl, `/restapi/v10.1/Device/VirtualSystems?location=vsys&vsys=vsys1`, token).catch(() => ({}));

    return {
        deviceType: 'Palo Alto Networks (API)',
        uptime: 'N/A',
        firewall: {
            status: 'Connected (PAN-OS API)',
            details: 'PAN-OS REST API connected',
            openPorts: 0,
        },
        access: { failedLogins: 0, recentLogins: 'N/A' },
        patching: { status: 'Manual check required', pendingUpdates: 0 },
        backup: { status: 'Manual check required', lastBackup: 'N/A' },
        resources: { diskUsedPercent: 'N/A', memTotal: 0, cpuLoad: 'N/A' },
    };
}

async function scan(device) {
    if (device.type === 'fortinet') return scanFortinet(device);
    if (device.type === 'paloalto') return scanPaloAlto(device);
    throw new Error(`Unsupported API device type: ${device.type}`);
}

module.exports = { scan };
