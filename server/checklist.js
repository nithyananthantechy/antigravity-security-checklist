/**
 * Checklist Engine
 * Maps raw scan results → security checklist items with auto-populated notes
 */

const MASTER_CHECKLIST = [
    // Network Security
    { id: 1,  cat: 'Network Security',       pri: 'High',   title: 'Review firewall logs for suspicious activity',           autoFill: 'firewall' },
    { id: 2,  cat: 'Network Security',       pri: 'High',   title: 'Check VPN connection logs and failed authentications',   autoFill: 'access' },
    { id: 3,  cat: 'Network Security',       pri: 'Medium', title: 'Verify IDS/IPS alerts and update signature rules',       autoFill: 'ids' },
    { id: 4,  cat: 'Network Security',       pri: 'Low',    title: 'Review bandwidth usage for anomalies',                   autoFill: 'wan' },
    { id: 5,  cat: 'Network Security',       pri: 'Medium', title: 'Test network segmentation effectiveness',                autoFill: null },
    { id: 6,  cat: 'Network Security',       pri: 'High',   title: 'Verify SNMP community strings are not default (public)', autoFill: null },
    { id: 7,  cat: 'Network Security',       pri: 'High',   title: 'Check interface errors and link status on switches',     autoFill: 'connectivity' },
    { id: 8,  cat: 'Network Security',       pri: 'Medium', title: 'Review DHCP lease table for rogue devices',              autoFill: null },

    // Server & Endpoint
    { id: 9,  cat: 'Server & Endpoint',      pri: 'High',   title: 'Review authentication & login event logs',               autoFill: 'access' },
    { id: 10, cat: 'Server & Endpoint',      pri: 'High',   title: 'Verify antivirus/EDR updates and detections',            autoFill: null },
    { id: 11, cat: 'Server & Endpoint',      pri: 'High',   title: 'Check server patch compliance',                          autoFill: 'patching' },
    { id: 12, cat: 'Server & Endpoint',      pri: 'Medium', title: 'Review unauthorized software installations',             autoFill: null },
    { id: 13, cat: 'Server & Endpoint',      pri: 'Medium', title: 'Audit running services and open ports',                  autoFill: 'firewall' },
    { id: 14, cat: 'Server & Endpoint',      pri: 'Low',    title: 'Monitor server resource utilization (CPU/RAM/Disk)',      autoFill: 'resources' },
    { id: 15, cat: 'Server & Endpoint',      pri: 'High',   title: 'Check for failed or stopped critical services',          autoFill: null },
    { id: 16, cat: 'Server & Endpoint',      pri: 'Medium', title: 'Verify OS version and kernel/build currency',            autoFill: 'osInfo' },

    // Patch Management
    { id: 17, cat: 'Patch Management',       pri: 'High',   title: 'Check package manager for available security updates',   autoFill: 'patching' },
    { id: 18, cat: 'Patch Management',       pri: 'High',   title: 'Review patch deployment status across all devices',      autoFill: 'patching' },
    { id: 19, cat: 'Patch Management',       pri: 'High',   title: 'Identify failed patch installations',                    autoFill: null },
    { id: 20, cat: 'Patch Management',       pri: 'Medium', title: 'Verify patch compliance percentage (95%+ target)',       autoFill: null },
    { id: 21, cat: 'Patch Management',       pri: 'High',   title: 'Check devices missing critical updates (30+ days)',      autoFill: null },
    { id: 22, cat: 'Patch Management',       pri: 'Medium', title: 'Review firmware version on network devices',             autoFill: 'osInfo' },
    { id: 23, cat: 'Patch Management',       pri: 'Low',    title: 'Schedule maintenance windows for patch deployments',     autoFill: null },

    // Access Management
    { id: 24, cat: 'Access Management',      pri: 'High',   title: 'Review privileged account access logs',                  autoFill: 'access' },
    { id: 25, cat: 'Access Management',      pri: 'High',   title: 'Audit new user accounts and permission changes',         autoFill: null },
    { id: 26, cat: 'Access Management',      pri: 'Medium', title: 'Check for dormant accounts (90+ days inactive)',         autoFill: null },
    { id: 27, cat: 'Access Management',      pri: 'High',   title: 'Review failed login attempts and account lockouts',      autoFill: 'access' },
    { id: 28, cat: 'Access Management',      pri: 'High',   title: 'Verify MFA enforcement for all admin accounts',          autoFill: null },
    { id: 29, cat: 'Access Management',      pri: 'Medium', title: 'Audit shared and service account usage',                 autoFill: null },

    // Firewall & Perimeter
    { id: 30, cat: 'Firewall & Perimeter',   pri: 'High',   title: 'Review and audit firewall rule set / ACLs',              autoFill: 'firewall' },
    { id: 31, cat: 'Firewall & Perimeter',   pri: 'High',   title: 'Verify firewall firmware is up to date',                 autoFill: 'osInfo' },
    { id: 32, cat: 'Firewall & Perimeter',   pri: 'High',   title: 'Check firewall HA / failover status',                    autoFill: 'ha' },
    { id: 33, cat: 'Firewall & Perimeter',   pri: 'Medium', title: 'Review inbound/outbound allow rules for overpermission',autoFill: null },
    { id: 34, cat: 'Firewall & Perimeter',   pri: 'High',   title: 'Confirm management access is not exposed to internet',   autoFill: null },
    { id: 35, cat: 'Firewall & Perimeter',   pri: 'Low',    title: 'Archive firewall config backup this week',               autoFill: null },

    // ISP & WAN
    { id: 36, cat: 'ISP & WAN',              pri: 'High',   title: 'Verify primary ISP link is up and stable',              autoFill: 'wan' },
    { id: 37, cat: 'ISP & WAN',              pri: 'High',   title: 'Check WAN failover / secondary ISP link status',         autoFill: 'wan' },
    { id: 38, cat: 'ISP & WAN',              pri: 'Medium', title: 'Monitor WAN latency and packet loss trends',             autoFill: 'wan' },
    { id: 39, cat: 'ISP & WAN',              pri: 'Low',    title: 'Review ISP SLA compliance report for the week',          autoFill: null },

    // Vulnerability Management
    { id: 40, cat: 'Vulnerability Mgmt',     pri: 'High',   title: 'Run full vulnerability scan (Nessus/Qualys/OpenVAS)',    autoFill: null },
    { id: 41, cat: 'Vulnerability Mgmt',     pri: 'High',   title: 'Review and prioritize critical/high CVEs',               autoFill: null },
    { id: 42, cat: 'Vulnerability Mgmt',     pri: 'Medium', title: 'Track remediation status of open findings',              autoFill: null },
    { id: 43, cat: 'Vulnerability Mgmt',     pri: 'High',   title: 'Check SSL/TLS certificate expiry (30-day warning)',      autoFill: null },
    { id: 44, cat: 'Vulnerability Mgmt',     pri: 'Medium', title: 'Scan web apps for OWASP Top 10',                        autoFill: null },
    { id: 45, cat: 'Vulnerability Mgmt',     pri: 'Medium', title: 'Review third-party software for known CVEs',             autoFill: null },

    // Backup & Recovery
    { id: 46, cat: 'Backup & Recovery',      pri: 'High',   title: 'Verify all scheduled backups completed (100%)',          autoFill: 'backup' },
    { id: 47, cat: 'Backup & Recovery',      pri: 'High',   title: 'Perform random backup restoration test',                 autoFill: null },
    { id: 48, cat: 'Backup & Recovery',      pri: 'Medium', title: 'Check backup storage capacity and retention policy',     autoFill: 'backup' },
    { id: 49, cat: 'Backup & Recovery',      pri: 'High',   title: 'Review offsite/cloud backup synchronization',            autoFill: null },
    { id: 50, cat: 'Backup & Recovery',      pri: 'Low',    title: 'Test disaster recovery runbook and RTO/RPO targets',     autoFill: null },

    // Compliance & Monitoring
    { id: 51, cat: 'Compliance',             pri: 'High',   title: 'Review SIEM alerts and security incidents',              autoFill: 'ids' },
    { id: 52, cat: 'Compliance',             pri: 'Medium', title: 'Check compliance dashboard (GDPR/ISO 27001/SOC2)',        autoFill: null },
    { id: 53, cat: 'Compliance',             pri: 'Medium', title: 'Review data access audit trails and FIM alerts',         autoFill: null },
    { id: 54, cat: 'Compliance',             pri: 'High',   title: 'Audit privileged access to sensitive data systems',      autoFill: null },
    { id: 55, cat: 'Compliance',             pri: 'Low',    title: 'Update security documentation and SOPs',                 autoFill: null },
    { id: 56, cat: 'Compliance',             pri: 'Medium', title: 'Generate and review weekly security metrics report',     autoFill: null },
    { id: 57, cat: 'Compliance',             pri: 'Low',    title: 'Review security awareness training completion metrics',  autoFill: null },
];

/**
 * Build a merged checklist from all scan results
 * @param {Array} scanResults - Array of { device, result } objects
 * @returns {Array} Annotated checklist tasks
 */
function buildChecklist(scanResults) {
    const timestamp = new Date().toLocaleString('en-IN');

    return MASTER_CHECKLIST.map(task => {
        const enriched = { ...task, completed: false, notes: '', sources: [] };

        if (!task.autoFill) return enriched;

        const relevantScans = scanResults.filter(sr => sr.result && !sr.error);

        for (const { device, result } of relevantScans) {
            const scanTime = device.lastScanAt ? new Date(device.lastScanAt).toLocaleString('en-IN') : timestamp;
            const src = `[Auto-filled ${scanTime} | ${device.name} — ${result.deviceType || device.type}]`;

            if (task.autoFill === 'firewall' && result.firewall) {
                enriched.completed = true;
                let fwNote = `${src} Status: ${result.firewall.status} | ${result.firewall.details || ''} | Open Ports: ${result.firewall.openPorts ?? 'N/A'}`;
                
                // If this is a log server, append the log findings too
                if (result.access && (device.name.toLowerCase().includes('log') || result.deviceType.toLowerCase().includes('log') || device.name.toLowerCase().includes('syslog'))) {
                    const failCount = result.access.failedLogins ?? 0;
                    if (failCount > 0) {
                        fwNote += ` | LOG ANALYSIS: Found ${failCount} security events (Blocks/Denies/Alerts) in syslog.`;
                        if (result.access.recentLogins) {
                            fwNote += ` | PROOF: Last 5 logs: ${result.access.recentLogins.substring(0, 150)}...`;
                        }
                    } else {
                        fwNote += ` | LOG ANALYSIS: Analyzed syslog - No security alerts or denied traffic found in current logs.`;
                    }
                }
                
                enriched.notes += fwNote + '\n';
                if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
            }
            if (task.autoFill === 'access') {
                if (result.access) {
                    enriched.completed = true;
                    enriched.notes += `${src} Failed Logins: ${result.access.failedLogins || 0} | ${result.access.recentLogins || ''}\n`;
                    if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
                }
                if (result.vpn) {
                    enriched.completed = true;
                    enriched.notes += `${src} VPN Tunnels Active: ${result.vpn.activeTunnels || 0}\n`;
                    if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
                }
            }
            if (task.autoFill === 'patching' && result.patching) {
                enriched.completed = true;
                enriched.notes += `${src} ${result.patching.status} — ${result.patching.pendingUpdates ?? 0} updates pending\n`;
                if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
            }
            if (task.autoFill === 'backup' && result.backup) {
                enriched.completed = result.backup.status?.includes('Successfully');
                let backupNote = `${src} Active Action Review: ${result.backup.status}`;
                if (result.backup.lastBackup && result.backup.lastBackup !== 'N/A') {
                    backupNote += ` | File/Result: ${result.backup.lastBackup}`;
                }
                enriched.notes += backupNote + '\n';
                if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
            }
            if (task.autoFill === 'resources' && result.resources) {
                enriched.completed = true;
                const r = result.resources;
                enriched.notes += `${src} Disk: ${r.diskUsedPercent}% | RAM: ${r.memUsed ?? 'N/A'}/${r.memTotal ?? 'N/A'} MB | CPU: ${r.loadAvg || r.cpuLoad || 'N/A'}\n`;
                if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
            }
            if (task.autoFill === 'wan' && result.wan) {
                enriched.completed = result.wan.reachable;
                enriched.notes += `${src} ${result.wan.quality} | Latency: ${result.wan.avgLatencyMs ?? 'N/A'}ms | Loss: ${result.wan.packetLoss ?? 'N/A'}%\n`;
                if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
            }
            if (task.autoFill === 'connectivity' && result.connectivity) {
                enriched.completed = true;
                let connNote = `${src} Vendor: ${result.connectivity.vendor || 'Unknown'} | Interfaces: ${result.connectivity.ifCount}`;
                if (result.connectivity.inboundErrors !== undefined) {
                    connNote += ` | Errors: In=${result.connectivity.inboundErrors}, Out=${result.connectivity.outboundErrors}`;
                }
                enriched.notes += connNote + '\n';
                if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
            }
            if (task.autoFill === 'ha' && result.firewall?.haStatus) {
                enriched.completed = true;
                enriched.notes += `${src} HA Status: ${result.firewall.haStatus}\n`;
                if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
            }
            if (task.autoFill === 'ids' && result.access) {
                enriched.completed = true;
                const alertCount = result.access.failedLogins || 0;
                enriched.notes += `${src} Security Events Detected: ${alertCount} | Log Samples: ${result.access.recentLogins || 'None'}\n`;
                if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
            }
            if (task.autoFill === 'osInfo') {
                const osNotes = result.kernelVersion ? `Kernel: ${result.kernelVersion}` :
                                (result.firmware || result.vendor?.includes('Assumed')) ? `Firmware: ${result.firmware || 'Generic SNMP'}` : null;
                if (osNotes) {
                    enriched.completed = true;
                    enriched.notes += `${src} ${osNotes}\n`;
                    if (!enriched.sources.includes(device.name)) enriched.sources.push(device.name);
                }
            }
        }

        enriched.notes = enriched.notes.trim();
        // Tasks with valid auto-filled notes are implicitly completed
        if (enriched.notes.length > 0) {
            enriched.completed = true;
        }
        return enriched;
    });
}

module.exports = { MASTER_CHECKLIST, buildChecklist };
