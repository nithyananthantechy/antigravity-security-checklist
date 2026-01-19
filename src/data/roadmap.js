export const PHASES = [
    {
        id: 1,
        title: "Phase 1: Quick Wins",
        duration: "Week 1-2",
        status: "active",
        items: [
            "Deploy basic firewall log monitoring",
            "Enable MFA for all admin accounts",
            "Patch all critical severity vulnerabilities",
            "Establish weekly review cadence"
        ]
    },
    {
        id: 2,
        title: "Phase 2: Integration",
        duration: "Week 3-4",
        status: "upcoming",
        items: [
            "Integrate SIEM for automated alerting",
            "Automate patch deployment with WSUS/SCCM",
            "Implement centralized logging",
            "Conduct first full disaster recovery test"
        ]
    },
    {
        id: 3,
        title: "Phase 3: Advanced Automation",
        duration: "Week 5-8",
        status: "locked",
        items: [
            "Deploy SOAR playbooks for incident response",
            "Automate vulnerability scanning and ticketing",
            "Implement zero-trust network access",
            "Full compliance dashboard automation"
        ]
    }
];
