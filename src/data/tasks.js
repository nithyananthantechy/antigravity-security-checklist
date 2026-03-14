export const CATEGORIES = [
    { id: 'Network Security',     label: 'Network Security',     icon: 'Network' },
    { id: 'Server & Endpoint',    label: 'Server & Endpoint',    icon: 'Server' },
    { id: 'Patch Management',     label: 'Patch Management',     icon: 'ShieldAlert' },
    { id: 'Access Management',    label: 'Access Management',    icon: 'Key' },
    { id: 'Firewall & Perimeter', label: 'Firewall & Perimeter', icon: 'Shield' },
    { id: 'ISP & WAN',            label: 'ISP & WAN',            icon: 'Globe' },
    { id: 'Vulnerability Mgmt',   label: 'Vulnerability Mgmt',   icon: 'Scan' },
    { id: 'Backup & Recovery',    label: 'Backup & Recovery',    icon: 'Database' },
    { id: 'Compliance',           label: 'Compliance',           icon: 'FileText' },
];

export const INITIAL_TASKS = [
    // Network Security (8)
    { id: 1,  category: 'Network Security',     priority: 'High',   title: 'Review firewall logs for suspicious activity',           completed: false, notes: '' },
    { id: 2,  category: 'Network Security',     priority: 'High',   title: 'Check VPN connection logs and failed authentications',   completed: false, notes: '' },
    { id: 3,  category: 'Network Security',     priority: 'Medium', title: 'Verify IDS/IPS alerts and update signature rules',       completed: false, notes: '' },
    { id: 4,  category: 'Network Security',     priority: 'Low',    title: 'Review bandwidth usage for anomalies',                   completed: false, notes: '' },
    { id: 5,  category: 'Network Security',     priority: 'Medium', title: 'Test network segmentation effectiveness',                completed: false, notes: '' },
    { id: 6,  category: 'Network Security',     priority: 'High',   title: 'Verify SNMP community strings are not default (public)', completed: false, notes: '' },
    { id: 7,  category: 'Network Security',     priority: 'High',   title: 'Check interface errors and link status on switches',     completed: false, notes: '' },
    { id: 8,  category: 'Network Security',     priority: 'Medium', title: 'Review DHCP lease table for rogue devices',              completed: false, notes: '' },

    // Server & Endpoint (8)
    { id: 9,  category: 'Server & Endpoint',    priority: 'High',   title: 'Review authentication & login event logs',               completed: false, notes: '' },
    { id: 10, category: 'Server & Endpoint',    priority: 'High',   title: 'Verify antivirus/EDR updates and detections',            completed: false, notes: '' },
    { id: 11, category: 'Server & Endpoint',    priority: 'High',   title: 'Check server patch compliance',                          completed: false, notes: '' },
    { id: 12, category: 'Server & Endpoint',    priority: 'Medium', title: 'Review unauthorized software installations',             completed: false, notes: '' },
    { id: 13, category: 'Server & Endpoint',    priority: 'Medium', title: 'Audit running services and open ports',                  completed: false, notes: '' },
    { id: 14, category: 'Server & Endpoint',    priority: 'Low',    title: 'Monitor server resource utilization (CPU/RAM/Disk)',     completed: false, notes: '' },
    { id: 15, category: 'Server & Endpoint',    priority: 'High',   title: 'Check for failed or stopped critical services',          completed: false, notes: '' },
    { id: 16, category: 'Server & Endpoint',    priority: 'Medium', title: 'Verify OS version and kernel/firmware currency',         completed: false, notes: '' },

    // Patch Management (7)
    { id: 17, category: 'Patch Management',     priority: 'High',   title: 'Check package manager for available security updates',   completed: false, notes: '' },
    { id: 18, category: 'Patch Management',     priority: 'High',   title: 'Review patch deployment status across all devices',      completed: false, notes: '' },
    { id: 19, category: 'Patch Management',     priority: 'High',   title: 'Identify failed patch installations',                    completed: false, notes: '' },
    { id: 20, category: 'Patch Management',     priority: 'Medium', title: 'Verify patch compliance percentage (95%+ target)',       completed: false, notes: '' },
    { id: 21, category: 'Patch Management',     priority: 'High',   title: 'Check devices missing critical updates (30+ days)',      completed: false, notes: '' },
    { id: 22, category: 'Patch Management',     priority: 'Medium', title: 'Review firmware version on network devices',             completed: false, notes: '' },
    { id: 23, category: 'Patch Management',     priority: 'Low',    title: 'Schedule maintenance windows for patch deployments',     completed: false, notes: '' },

    // Access Management (6)
    { id: 24, category: 'Access Management',    priority: 'High',   title: 'Review privileged account access logs',                  completed: false, notes: '' },
    { id: 25, category: 'Access Management',    priority: 'High',   title: 'Audit new user accounts and permission changes',         completed: false, notes: '' },
    { id: 26, category: 'Access Management',    priority: 'Medium', title: 'Check for dormant accounts (90+ days inactive)',         completed: false, notes: '' },
    { id: 27, category: 'Access Management',    priority: 'High',   title: 'Review failed login attempts and account lockouts',      completed: false, notes: '' },
    { id: 28, category: 'Access Management',    priority: 'High',   title: 'Verify MFA enforcement for all admin accounts',          completed: false, notes: '' },
    { id: 29, category: 'Access Management',    priority: 'Medium', title: 'Audit shared and service account usage',                 completed: false, notes: '' },

    // Firewall & Perimeter (6)
    { id: 30, category: 'Firewall & Perimeter', priority: 'High',   title: 'Review and audit firewall rule set / ACLs',              completed: false, notes: '' },
    { id: 31, category: 'Firewall & Perimeter', priority: 'High',   title: 'Verify firewall firmware is up to date',                 completed: false, notes: '' },
    { id: 32, category: 'Firewall & Perimeter', priority: 'High',   title: 'Check firewall HA / failover cluster status',            completed: false, notes: '' },
    { id: 33, category: 'Firewall & Perimeter', priority: 'Medium', title: 'Review inbound/outbound rules for over-permission',      completed: false, notes: '' },
    { id: 34, category: 'Firewall & Perimeter', priority: 'High',   title: 'Confirm management access is not exposed to internet',   completed: false, notes: '' },
    { id: 35, category: 'Firewall & Perimeter', priority: 'Low',    title: 'Archive firewall configuration backup this week',        completed: false, notes: '' },

    // ISP & WAN (4)
    { id: 36, category: 'ISP & WAN',            priority: 'High',   title: 'Verify primary ISP link is up and stable',               completed: false, notes: '' },
    { id: 37, category: 'ISP & WAN',            priority: 'High',   title: 'Check WAN failover / secondary ISP link status',         completed: false, notes: '' },
    { id: 38, category: 'ISP & WAN',            priority: 'Medium', title: 'Monitor WAN latency and packet loss trends',             completed: false, notes: '' },
    { id: 39, category: 'ISP & WAN',            priority: 'Low',    title: 'Review ISP SLA compliance report for the week',          completed: false, notes: '' },

    // Vulnerability Management (6)
    { id: 40, category: 'Vulnerability Mgmt',   priority: 'High',   title: 'Run full vulnerability scan (Nessus/Qualys/OpenVAS)',    completed: false, notes: '' },
    { id: 41, category: 'Vulnerability Mgmt',   priority: 'High',   title: 'Review and prioritize critical/high CVEs',               completed: false, notes: '' },
    { id: 42, category: 'Vulnerability Mgmt',   priority: 'Medium', title: 'Track remediation status of open findings',              completed: false, notes: '' },
    { id: 43, category: 'Vulnerability Mgmt',   priority: 'High',   title: 'Check SSL/TLS certificate expiry (30-day warning)',      completed: false, notes: '' },
    { id: 44, category: 'Vulnerability Mgmt',   priority: 'Medium', title: 'Scan web apps for OWASP Top 10',                        completed: false, notes: '' },
    { id: 45, category: 'Vulnerability Mgmt',   priority: 'Medium', title: 'Review third-party software for known CVEs',             completed: false, notes: '' },

    // Backup & Recovery (5)
    { id: 46, category: 'Backup & Recovery',    priority: 'High',   title: 'Verify all scheduled backups completed (100%)',          completed: false, notes: '' },
    { id: 47, category: 'Backup & Recovery',    priority: 'High',   title: 'Perform random backup restoration test',                 completed: false, notes: '' },
    { id: 48, category: 'Backup & Recovery',    priority: 'Medium', title: 'Check backup storage capacity and retention policy',     completed: false, notes: '' },
    { id: 49, category: 'Backup & Recovery',    priority: 'High',   title: 'Review offsite/cloud backup synchronization',            completed: false, notes: '' },
    { id: 50, category: 'Backup & Recovery',    priority: 'Low',    title: 'Test disaster recovery runbook and RTO/RPO targets',     completed: false, notes: '' },

    // Compliance (7)
    { id: 51, category: 'Compliance',           priority: 'High',   title: 'Review SIEM alerts and security incidents',              completed: false, notes: '' },
    { id: 52, category: 'Compliance',           priority: 'Medium', title: 'Check compliance dashboard (GDPR/ISO 27001/SOC2)',        completed: false, notes: '' },
    { id: 53, category: 'Compliance',           priority: 'Medium', title: 'Review data access audit trails and FIM alerts',         completed: false, notes: '' },
    { id: 54, category: 'Compliance',           priority: 'High',   title: 'Audit privileged access to sensitive data systems',      completed: false, notes: '' },
    { id: 55, category: 'Compliance',           priority: 'Low',    title: 'Update security documentation and SOPs',                 completed: false, notes: '' },
    { id: 56, category: 'Compliance',           priority: 'Medium', title: 'Generate and review weekly security metrics report',     completed: false, notes: '' },
    { id: 57, category: 'Compliance',           priority: 'Low',    title: 'Review security awareness training completion metrics',  completed: false, notes: '' },
];
