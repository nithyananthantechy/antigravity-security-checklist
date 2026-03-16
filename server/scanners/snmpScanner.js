/**
 * SNMP Scanner — Network Devices & Firewalls (Cisco, generic switches, routers)
 * Uses SNMP v2c community string. No SSH needed.
 * OIDs collected: sysDescr, sysUptime, ifNumber, hrProcessorLoad, hrStorageUsed
 */
const snmp = require('net-snmp');

const OIDs = {
    sysDescr:      '1.3.6.1.2.1.1.1.0',
    sysUptime:     '1.3.6.1.2.1.1.3.0',
    sysName:       '1.3.6.1.2.1.1.5.0',
    sysContact:    '1.3.6.1.2.1.1.4.0',
    sysLocation:   '1.3.6.1.2.1.1.6.0',
    ifNumber:      '1.3.6.1.2.1.2.1.0',
    // Cisco-specific OID for CPU 5-min avg
    ciscoCPU:      '1.3.6.1.4.1.9.2.1.58.0',
    // Host Resources MIB
    hrMemSize:     '1.3.6.1.2.1.25.2.2.0',
};

function snmpGet(session, oids) {
    return new Promise((resolve) => {
        session.get(oids, (err, varbinds) => {
            if (err) return resolve({});
            const result = {};
            varbinds.forEach((vb, i) => {
                if (!snmp.isVarbindError(vb)) {
                    result[oids[i]] = vb.value.toString();
                }
            });
            resolve(result);
        });
    });
}

async function scan(device) {
    const community = device.auth?.community || 'public';
    const version = device.auth?.snmpVersion === 'v3' ? snmp.Version3 : snmp.Version2c;

    let session;
    try {
        session = snmp.createSession(device.ip, community, {
            port: device.port || 161,
            timeout: 8000,
            retries: 1,
            version,
        });

        const data = await snmpGet(session, Object.values(OIDs));

        const sysDescr   = data[OIDs.sysDescr]   || 'Unknown device';
        const sysUptime  = data[OIDs.sysUptime]   || '0';
        const ifCount    = parseInt(data[OIDs.ifNumber]) || 0;
        const cpuLoad    = data[OIDs.ciscoCPU]    || 'N/A';
        const sysName    = data[OIDs.sysName]     || device.name;
        const memSize    = parseInt(data[OIDs.hrMemSize]) || 0;

        // Convert SNMP timeticks to human-readable
        const uptimeTicks = parseInt(sysUptime) || 0;
        const uptimeDays  = Math.floor(uptimeTicks / 8640000);
        const uptimeHours = Math.floor((uptimeTicks % 8640000) / 360000);
        const uptimeStr   = `${uptimeDays}d ${uptimeHours}h`;

        // Determine vendor from sysDescr
        let vendor = 'Unknown';
        const desc = sysDescr.toLowerCase();
        if (desc.includes('cisco'))   vendor = 'Cisco';
        if (desc.includes('fortinet') || desc.includes('fortigate')) vendor = 'Fortinet FortiGate';
        if (desc.includes('juniper')) vendor = 'Juniper';
        if (desc.includes('aruba'))   vendor = 'Aruba';
        if (desc.includes('mikrotik')) vendor = 'MikroTik';
        if (desc.includes('paloalto') || desc.includes('pan-os')) vendor = 'Palo Alto';

        // Extract Firmware/OS version if available
        let firmware = null;
        if (vendor === 'Fortinet FortiGate') {
            const fwMatch = desc.match(/v(\d+\.\d+\.\d+)/);
            if (fwMatch) firmware = `FortiOS v${fwMatch[1]}`;
        } else if (vendor === 'Cisco') {
            const mMatch = sysDescr.match(/(Version|Software)\s+([^,]+)/i);
            if (mMatch) firmware = mMatch[2].trim();
        } else if (vendor === 'Palo Alto') {
            const poMatch = sysDescr.match(/pan-os\s*(\d+\.\d+\.\d+)/i);
            if (poMatch) firmware = `PAN-OS ${poMatch[1]}`;
        }

        return {
            deviceType: `Network Device (SNMP) — ${vendor}`,
            uptime: uptimeStr,
            sysDescription: sysDescr.substring(0, 200),
            sysName,
            vendor,
            firmware, // Now populates the OS/firmware checklist item properly
            firewall: {
                status: 'Connected via SNMP',
                details: `Interfaces: ${ifCount} | CPU Load: ${cpuLoad}%`,
                // We removed openPorts: 0 to avoid false positives!
            },
            resources: {
                diskUsedPercent: 'N/A',
                memTotal: Math.round(memSize / 1024),
                cpuLoad: cpuLoad !== 'N/A' ? `${cpuLoad}%` : 'N/A',
            },
            connectivity: {
                ifCount,
                vendor,
                sysDescr,
            }
        };
    } catch (err) {
        throw new Error(`SNMP scan failed: ${err.message}`);
    } finally {
        if (session) session.close();
    }
}

module.exports = { scan };
