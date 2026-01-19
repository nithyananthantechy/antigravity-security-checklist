export const firewallService = {
    // CONNECT TO REAL BACKEND
    runScan: async (type, credentials) => {
        try {
            // Dynamically determine the backend URL
            // If VITE_API_URL is set, use it. Otherwise, assume backend is on port 3001 of the same host.
            const API_BASE_URL = import.meta.env?.VITE_API_URL || `http://${window.location.hostname}:3001`;

            const response = await fetch(`${API_BASE_URL}/api/scan`, {
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
