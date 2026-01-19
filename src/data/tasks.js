export const CATEGORIES = [
    { id: 'network', label: 'Network Security', icon: 'Network' },
    { id: 'server', label: 'Server & Endpoint', icon: 'Server' },
    { id: 'patch', label: 'Patch Management', icon: 'ShieldAlert' },
    { id: 'access', label: 'Access Management', icon: 'Key' },
    { id: 'vuln', label: 'Vulnerability Mgmt', icon: 'Scan' },
    { id: 'backup', label: 'Backup & Recovery', icon: 'Database' },
    { id: 'compliance', label: 'Compliance', icon: 'FileText' },
];

export const INITIAL_TASKS = [
    /* Network Security (5) */
    { id: 1, category: 'network', title: 'Review firewall logs for suspicious activity', priority: 'High', completed: false, notes: '' },
    { id: 2, category: 'network', title: 'Check VPN connection logs and failed authentications', priority: 'High', completed: false, notes: '' },
    { id: 3, category: 'network', title: 'Verify IDS/IPS alerts and update rules', priority: 'Medium', completed: false, notes: '' },
    { id: 4, category: 'network', title: 'Review bandwidth usage for anomalies', priority: 'Low', completed: false, notes: '' },
    { id: 5, category: 'network', title: 'Test network segmentation effectiveness', priority: 'Medium', completed: false, notes: '' },

    /* Server & Endpoint (6) */
    { id: 6, category: 'server', title: 'Review Windows Security Event Logs (4624, 4625, 4720)', priority: 'High', completed: false, notes: '' },
    { id: 7, category: 'server', title: 'Verify antivirus/EDR updates and detections', priority: 'High', completed: false, notes: '' },
    { id: 8, category: 'server', title: 'Check server patch compliance', priority: 'High', completed: false, notes: '' },
    { id: 9, category: 'server', title: 'Review unauthorized software installations', priority: 'Medium', completed: false, notes: '' },
    { id: 10, category: 'server', title: 'Audit running services and open ports', priority: 'Medium', completed: false, notes: '' },
    { id: 11, category: 'server', title: 'Monitor server resource utilization', priority: 'Low', completed: false, notes: '' },

    /* Windows Patch Management (7) */
    { id: 12, category: 'patch', title: 'Check WSUS/SCCM for available updates', priority: 'High', completed: false, notes: '' },
    { id: 13, category: 'patch', title: 'Review patch deployment status', priority: 'High', completed: false, notes: '' },
    { id: 14, category: 'patch', title: 'Identify failed patch installations', priority: 'High', completed: false, notes: '' },
    { id: 15, category: 'patch', title: 'Verify patch compliance percentage (95%+ target)', priority: 'Medium', completed: false, notes: '' },
    { id: 16, category: 'patch', title: 'Check for machines missing critical updates (30+ days)', priority: 'High', completed: false, notes: '' },
    { id: 17, category: 'patch', title: 'Review and approve pending updates in test environment', priority: 'Medium', completed: false, notes: '' },
    { id: 18, category: 'patch', title: 'Schedule maintenance windows for deployments', priority: 'Low', completed: false, notes: '' },

    /* Access Management (6) */
    { id: 19, category: 'access', title: 'Review privileged account access logs', priority: 'High', completed: false, notes: '' },
    { id: 20, category: 'access', title: 'Audit new user accounts and permissions', priority: 'High', completed: false, notes: '' },
    { id: 21, category: 'access', title: 'Check for dormant accounts (90+ days inactive)', priority: 'Medium', completed: false, notes: '' },
    { id: 22, category: 'access', title: 'Review failed login attempts and lockouts', priority: 'High', completed: false, notes: '' },
    { id: 23, category: 'access', title: 'Verify MFA enforcement for admin accounts', priority: 'High', completed: false, notes: '' },
    { id: 24, category: 'access', title: 'Audit shared account and service account usage', priority: 'Medium', completed: false, notes: '' },

    /* Vulnerability Management (6) */
    { id: 25, category: 'vuln', title: 'Run full vulnerability scan (Nessus/Qualys/OpenVAS)', priority: 'High', completed: false, notes: '' },
    { id: 26, category: 'vuln', title: 'Review and prioritize critical/high CVEs', priority: 'High', completed: false, notes: '' },
    { id: 27, category: 'vuln', title: 'Track remediation status of findings', priority: 'Medium', completed: false, notes: '' },
    { id: 28, category: 'vuln', title: 'Check SSL/TLS certificate expiry (30-day warning)', priority: 'High', completed: false, notes: '' },
    { id: 29, category: 'vuln', title: 'Scan web apps for OWASP Top 10', priority: 'Medium', completed: false, notes: '' },
    { id: 30, category: 'vuln', title: 'Review third-party software vulnerabilities', priority: 'Medium', completed: false, notes: '' },

    /* Backup & Recovery (5) */
    { id: 31, category: 'backup', title: 'Verify all scheduled backups completed (100%)', priority: 'High', completed: false, notes: '' },
    { id: 32, category: 'backup', title: 'Perform random backup restoration test', priority: 'High', completed: false, notes: '' },
    { id: 33, category: 'backup', title: 'Check backup storage capacity and retention', priority: 'Medium', completed: false, notes: '' },
    { id: 34, category: 'backup', title: 'Review offsite/cloud backup synchronization', priority: 'High', completed: false, notes: '' },
    { id: 35, category: 'backup', title: 'Test disaster recovery runbook', priority: 'Low', completed: false, notes: '' },

    /* Compliance & Monitoring (7) */
    { id: 36, category: 'compliance', title: 'Review SIEM alerts and security incidents', priority: 'High', completed: false, notes: '' },
    { id: 37, category: 'compliance', title: 'Check compliance dashboard (GDPR/HIPAA/ISO 27001)', priority: 'Medium', completed: false, notes: '' },
    { id: 38, category: 'compliance', title: 'Review data access audit trails and FIM', priority: 'Medium', completed: false, notes: '' },
    { id: 39, category: 'compliance', title: 'Audit privileged access to sensitive data', priority: 'High', completed: false, notes: '' },
    { id: 40, category: 'compliance', title: 'Update security documentation and SOPs', priority: 'Low', completed: false, notes: '' },
    { id: 41, category: 'compliance', title: 'Generate weekly security metrics report', priority: 'Medium', completed: false, notes: '' },
    { id: 42, category: 'compliance', title: 'Review security training completion metrics', priority: 'Low', completed: false, notes: '' },
];
