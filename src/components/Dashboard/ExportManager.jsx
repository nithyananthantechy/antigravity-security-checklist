import React, { useState, useEffect } from 'react';
import { Download, HardDrive, ShieldCheck, CheckSquare, Loader, Calendar, Filter } from 'lucide-react';

const API_BASE = `http://${window.location.hostname}:3001`;

const ExportManager = ({ fullChecklist }) => {
    const [devices, setDevices] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState(new Set());
    const [exportDataSelection, setExportDataSelection] = useState({
        checklist: true,
        deviceInfo: false
    });
    const [dateRange, setDateRange] = useState({
        start: '',
        end: new Date().toISOString().slice(0, 10)
    });
    const [isExporting, setIsExporting] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Load devices
        fetch(`${API_BASE}/api/devices`)
            .then(r => r.json())
            .then(data => {
                const devList = Array.isArray(data) ? data : [];
                setDevices(devList);
                setSelectedDevices(new Set(devList.map(d => d.id)));
            }).catch(() => {});

        // Load history for date-based export
        fetch(`${API_BASE}/api/history`)
            .then(r => r.json())
            .then(data => {
                setHistory(Array.isArray(data) ? data : []);
            }).catch(() => {});
    }, []);

    const handleDeviceSelection = (id) => {
        const newSet = new Set(selectedDevices);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedDevices(newSet);
    };

    const handleSelectAllDevices = () => {
        if (selectedDevices.size === devices.length) setSelectedDevices(new Set());
        else setSelectedDevices(new Set(devices.map(d => d.id)));
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const selectedDeviceObjects = devices.filter(d => selectedDevices.has(d.id));
            const selectedDeviceNamesOrIPs = selectedDeviceObjects.flatMap(d => [d.name, d.ip, d.id]);

            let fileContent = '';

            // Filter data based on date range if provided
            const isDateFilterActive = dateRange.start || dateRange.end;
            
            // For historical export, we might want to consolidate multiple scans
            // But for now, we'll export the "Live" state filtered by devices, 
            // OR if a date range is picked, we export historical log entries as CSV.

            if (isDateFilterActive) {
                fileContent += `=== AUDIT LOG EXPORT (${dateRange.start || 'Beginning'} to ${dateRange.end || 'Today'}) ===\n\n`;
                
                const filteredHistory = history.filter(h => {
                    const hDate = h.timestamp?.slice(0, 10);
                    if (dateRange.start && hDate < dateRange.start) return false;
                    if (dateRange.end && hDate > dateRange.end) return false;
                    if (selectedDevices.size < devices.length && !selectedDevices.has(h.deviceId)) return false;
                    return true;
                });

                fileContent += 'Timestamp,Device,Type,Status,Security Events (Logs),Firewall/HA Status,System/Link Health,Error\n';
                filteredHistory.forEach(h => {
                    const failLogins = h.result?.access?.failedLogins !== undefined ? h.result.access.failedLogins : 'N/A (SNMP)';
                    
                    let fwStatus = h.result?.firewall?.status;
                    if (h.result?.firewall?.haStatus) fwStatus += ` (${h.result.firewall.haStatus})`;
                    if (!fwStatus && h.result?.connectivity) fwStatus = `Connected (${h.result.connectivity.ifCount} ints)`;
                    if (!fwStatus) fwStatus = 'N/A';

                    let healthStatus = h.result?.patching?.status;
                    if (!healthStatus && h.result?.connectivity) {
                        const inErr = h.result.connectivity.inboundErrors || 0;
                        const outErr = h.result.connectivity.outboundErrors || 0;
                        healthStatus = `Link: ${inErr + outErr > 0 ? 'Errors detected' : 'Healthy'} (In=${inErr}, Out=${outErr})`;
                    }
                    if (h.result?.firmware) healthStatus = `${h.result.firmware} | ${healthStatus || ''}`;
                    if (!healthStatus) healthStatus = 'Manual Verification required';

                    const row = [
                        new Date(h.timestamp).toLocaleString(),
                        h.deviceName || h.deviceId,
                        h.scanType,
                        h.error ? 'Failed' : 'Success',
                        `"${failLogins}"`,
                        `"${fwStatus}"`,
                        `"${healthStatus}"`,
                        `"${(h.error || '').replace(/"/g, '""')}"`
                    ].join(',');
                    fileContent += row + '\n';
                });

                if (filteredHistory.length === 0) {
                    fileContent += '(No data found for this range)\n';
                }
            } else {
                // Device Info CSV Section
                if (exportDataSelection.deviceInfo) {
                    fileContent += '=== DEVICE INVENTORY ===\n';
                    fileContent += 'ID,Name,Type,IP,Last Scan Status,Uptime\n';
                    selectedDeviceObjects.forEach(d => {
                        const status = d.lastScanError ? `Error: ${d.lastScanError}` : 'Online';
                        fileContent += `${d.id},${d.name},${d.type},${d.ip},"${status}","${d.lastScan?.uptime ? d.lastScan.uptime.replace(/\n/g, ' ') : 'N/A'}"\n`;
                    });
                    fileContent += '\n\n';
                }

                // Checklist CSV Section
                if (exportDataSelection.checklist) {
                    fileContent += '=== SECURITY CHECKLIST (LIVE STATE) ===\n';
                    fileContent += 'ID,Category,Priority,Task,Completed,Notes,Source Devices\n';
                    
                    const tasksToExport = fullChecklist.filter(task => {
                        if (selectedDevices.size === devices.length) return true;
                        if (!task.sources || task.sources.length === 0) return true;
                        return task.sources.some(src => selectedDeviceNamesOrIPs.some(sd => src.includes(sd) || sd.includes(src)));
                    });

                    tasksToExport.forEach(task => {
                        const line = [
                            task.id,
                            `"${task.category}"`,
                            task.priority,
                            `"${task.title}"`,
                            task.completed ? 'Yes' : 'No',
                            `"${task.notes ? task.notes.replace(/\n/g, ' | ').replace(/"/g, '""') : ''}"`,
                            `"${task.sources ? task.sources.join(', ') : ''}"`
                        ].join(',');
                        fileContent += line + '\n';
                    });
                }
            }

            // Create blob and download
            const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = isDateFilterActive ? `Audit_Log_${dateRange.start}_to_${dateRange.end}.csv` : `SecOps_Export_${new Date().toISOString().slice(0, 10)}.csv`;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
            
            setTimeout(() => { setIsExporting(false); }, 500);

        } catch (err) {
            console.error('Export failed', err);
            setIsExporting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Download size={24} color="var(--primary)" /> Configuration & Data Export
                </h2>
                <button 
                    onClick={handleExport}
                    disabled={isExporting || (selectedDevices.size === 0 && !dateRange.start)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '8px', cursor: (isExporting || (selectedDevices.size === 0 && !dateRange.start)) ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}>
                    {isExporting ? <Loader size={18} className="spin" /> : <Download size={18} />} 
                    {isExporting ? 'Generating Report...' : 'Download CSV Report'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* left Column: Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Date Range Selection */}
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} /> Date Range Selection
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Start Date</label>
                                <input 
                                    type="date" 
                                    value={dateRange.start} 
                                    onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', colorScheme: 'dark' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>End Date</label>
                                <input 
                                    type="date" 
                                    value={dateRange.end} 
                                    onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                        <p style={{ margin: '12px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            * Selecting dates will export historical audit logs instead of the live checklist.
                        </p>
                    </div>

                    {/* Data Type Selection */}
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckSquare size={18} /> Data Type Selection
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: exportDataSelection.checklist ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.2)', border: exportDataSelection.checklist ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <input type="checkbox" checked={exportDataSelection.checklist} onChange={e => setExportDataSelection(p => ({ ...p, checklist: e.target.checked }))} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: exportDataSelection.checklist ? 'white' : 'var(--text-muted)' }}>Security Checklist</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current audit states and automated results</div>
                                </div>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: exportDataSelection.deviceInfo ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.2)', border: exportDataSelection.deviceInfo ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <input type="checkbox" checked={exportDataSelection.deviceInfo} onChange={e => setExportDataSelection(p => ({ ...p, deviceInfo: e.target.checked }))} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: exportDataSelection.deviceInfo ? 'white' : 'var(--text-muted)' }}>Device Inventory</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IP addresses, types, and resource uptimes</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Device Selection */}
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HardDrive size={18} /> Source Devices
                        </h4>
                        <button onClick={handleSelectAllDevices} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                            {selectedDevices.size === devices.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', flex: 1, minHeight: '300px', overflowY: 'auto', padding: '0.5rem' }}>
                        {devices.length === 0 ? (
                            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Filter size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <div>No devices found to filter.</div>
                            </div>
                        ) : (
                            devices.map(d => (
                                <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', background: selectedDevices.has(d.id) ? 'rgba(6,182,212,0.08)' : 'transparent', border: '1px solid transparent', transition: 'all 0.2s', marginBottom: '4px' }}>
                                    <input type="checkbox" checked={selectedDevices.has(d.id)} onChange={() => handleDeviceSelection(d.id)} style={{ width: '16px', height: '16px', accentColor: '#06b6d4' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: selectedDevices.has(d.id) ? 'white' : 'var(--text-muted)' }}>{d.name || d.id}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7 }}>{d.ip} — <span style={{ textTransform: 'uppercase' }}>{d.type}</span></div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ExportManager;
