export const firewallService = {
    // Simulate fetching data from firewall scripts and network devices
    runScan: async (type, credentials) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        const timestamp = new Date().toLocaleString();
        const randomVariance = (base) => Math.floor(base + (Math.random() * 20) - 10);

        // Comprehensive Security Report simulating data from Fortigate + Server Agents
        return {
            timestamp,
            device: {
                type: type,
                ip: credentials?.ip || '192.168.1.1',
                name: credentials?.name || 'Primary-Firewall-01',
                uptime: '45d 12h 30m'
            },
            title: `Full Diagnostics Report: ${type.toUpperCase()}`,
            summary: {
                totalBlocked: randomVariance(1247),
                uniqueSourceIPs: randomVariance(89),
                failedAuth: randomVariance(234),
                topPort: '3389 (RDP)',
                peakTime: '02:00-04:00 UTC'
            },
            // Detailed Modules for Logic Mapping
            modules: {
                firewall: {
                    status: 'Active',
                    logs_analyzed: 15420,
                    critical_events: randomVariance(5)
                },
                vpn: {
                    status: 'Operational',
                    active_tunnels: randomVariance(12),
                    failed_logins: randomVariance(3),
                    notes: 'No unauthorized access detected. All users enforced with MFA.'
                },
                patching: {
                    status: 'Compliant',
                    scan_target: 'Windows-Server-2019-Fleet',
                    missing_critical: 0,
                    devices_scanned: 15,
                    notes: 'All critical updates from last Tuesday patch cycle applied.'
                },
                backup: {
                    status: 'Success',
                    last_backup: new Date(Date.now() - 3600000).toLocaleString(), // 1 hour ago
                    retention_policy: '30 Days',
                    integrity_check: 'Passed',
                    notes: 'Daily backup verification successful. Offsite sync complete.'
                },
                compliance: {
                    score: 98,
                    issues: ['Minor: TLS 1.0 disabled', 'Audit log retention > 90 days']
                }
            },
            threats: [
                { name: 'RDP Brute Force', count: randomVariance(450), color: '#ec4899' },
                { name: 'SMB Scan', count: randomVariance(320), color: '#8b5cf6' },
                { name: 'SQL Injection', count: randomVariance(180), color: '#06b6d4' },
                { name: 'Malware Traffic', count: randomVariance(90), color: '#ef4444' },
                { name: 'Port Scanning', count: randomVariance(207), color: '#f59e0b' }
            ],
            sources: [
                { country: 'Unknown/Proxy', value: 45 },
                { country: 'CN', value: 25 },
                { country: 'RU', value: 15 },
                { country: 'US', value: 10 },
                { country: 'Other', value: 5 }
            ]
        };
    },

    // Helper to construct detailed notes based on the module data
    generateModuleNote: (moduleType, data, timestamp) => {
        const header = `🔒 Auto-Populated (${timestamp})\n[Source: Integrated Device Scan]\n`;

        switch (moduleType) {
            case 'firewall':
                return `${header}
✓ Logs Analyzed: ${data.logs_analyzed}
✓ Critical Events: ${data.critical_events}
✓ Status: ${data.status}
- Recommendation: Continue monitoring port 3389 traffic.`;

            case 'vpn':
                return `${header}
✓ Active Tunnels: ${data.active_tunnels}
✓ Failed Logins: ${data.failed_logins}
✓ MFA Status: Enforced
- Notes: ${data.notes}`;

            case 'patching':
                return `${header}
✓ Devices Scanned: ${data.devices_scanned}
✓ Missing Critical: ${data.missing_critical}
✓ Compliance: ${data.status}
- Notes: ${data.notes}`;

            case 'backup':
                return `${header}
✓ Last Success: ${data.last_backup}
✓ Integrity Check: ${data.integrity_check}
✓ Retention: ${data.retention_policy}
- Notes: ${data.notes}`;

            default:
                return 'Data retrieved successfully.';
        }
    }
};
