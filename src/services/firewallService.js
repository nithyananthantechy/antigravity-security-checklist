export const firewallService = {
    // CONNECT TO REAL BACKEND
    runScan: async (type, credentials) => {
        try {
            const response = await fetch('http://localhost:3001/api/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, credentials }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Scan failed');
            }

            return await response.json();
        } catch (error) {
            console.error("Real Scan Error:", error);
            // Fallback or re-throw
            throw error;
        }
    },

    // Helper to construct detailed notes based on the module data
    generateModuleNote: (moduleType, data, timestamp) => {
        const header = `🔒 Auto-Populated (${timestamp})\n[Source: Real Live Device]\n`;

        if (!data) return "No data available.";

        switch (moduleType) {
            case 'firewall':
                return `${header}
✓ Status: ${data.status}
✓ Logs Analyzed: ${data.logs_analyzed || 'N/A'}
✓ Critical Events: ${data.critical_events || 0}`;

            case 'vpn':
                return `${header}
✓ Status: ${data.status}
✓ Active Tunnels: ${data.active_tunnels || 0}
✓ Failed Logins: ${data.failed_logins || 0}
${data.notes ? `- Notes: ${data.notes}` : ''}`;

            case 'patching':
                return `${header}
✓ Compliance: ${data.status}
✓ Missing Critical: ${data.missing_critical || 0}
${data.notes ? `- Notes: ${data.notes}` : ''}`;

            case 'backup':
                return `${header}
✓ Last Success: ${data.last_backup}
✓ Integrity: ${data.integrity_check || 'Unknown'}`;

            default:
                return 'Data retrieved successfully.';
        }
    }
};
