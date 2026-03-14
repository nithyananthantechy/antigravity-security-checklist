import React, { useState, useEffect, useCallback } from 'react';
import {
    Server, Plus, Trash2, Play, RefreshCw, Wifi, WifiOff,
    ChevronDown, ChevronUp, Shield, Monitor, Network, Globe,
    Eye, EyeOff, X, CheckCircle, AlertCircle, Loader, Settings
} from 'lucide-react';

const API_BASE = `http://${window.location.hostname}:3001`;

const DEVICE_TYPE_META = {
    linux:    { label: 'Linux Server',         icon: '🐧', color: '#10b981', protocol: 'SSH', defaultPort: 22, authFields: ['username','password','port'] },
    windows:  { label: 'Windows Server/PC',    icon: '🪟', color: '#06b6d4', protocol: 'WinRM', defaultPort: 5985, authFields: ['username','password'] },
    snmp:     { label: 'Network Device (SNMP)',icon: '🔌', color: '#8b5cf6', protocol: 'SNMP v2c', defaultPort: 161, authFields: ['community'] },
    fortinet: { label: 'Fortinet FortiGate',   icon: '🔥', color: '#f59e0b', protocol: 'REST API (HTTPS)', defaultPort: 443, authFields: ['apiToken'] },
    paloalto: { label: 'Palo Alto Networks',   icon: '🛡️', color: '#ef4444', protocol: 'REST API (HTTPS)', defaultPort: 443, authFields: ['apiToken'] },
    cisco:    { label: 'Cisco ASA/IOS',        icon: '📡', color: '#3b82f6', protocol: 'SSH or SNMP', defaultPort: 22, authFields: ['username','password','port','community'] },
    isp:      { label: 'ISP / WAN Link',       icon: '🌐', color: '#ec4899', protocol: 'Ping (ICMP)', defaultPort: null, authFields: [] },
    macos:    { label: 'macOS Endpoint',       icon: '🍎', color: '#94a3b8', protocol: 'SSH', defaultPort: 22, authFields: ['username','password','port'] },
};

const STATUS_COLORS = { idle: '#64748b', scanning: '#f59e0b', success: '#10b981', error: '#ef4444' };

function AddDeviceModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name:'', type:'linux', ip:'', port:'22', auth:{ username:'', password:'', community:'public', apiToken:'' } });
    const [showPwd, setShowPwd] = useState(false);
    const meta = DEVICE_TYPE_META[form.type];

    // Auto-update default port when type changes
    const setType = (t) => setForm(prev => ({ ...prev, type: t, port: String(DEVICE_TYPE_META[t]?.defaultPort || '') }));
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const setAuth = (k, v) => setForm(prev => ({ ...prev, auth: { ...prev.auth, [k]: v } }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.ip) return alert('Device name and IP are required');
        onAdd(form);
    };

    const inputStyle = { width:'100%', padding:'0.5rem 0.75rem', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px', color:'white', fontSize:'0.9rem', boxSizing:'border-box' };
    const labelStyle = { display:'block', fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'4px' };

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div className="glass-panel" style={{ width:'100%', maxWidth:'520px', padding:'2rem', maxHeight:'90vh', overflowY:'auto' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                    <h3 style={{ margin:0, fontSize:'1.2rem' }}>Add New Device</h3>
                    <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Device Type */}
                    <div style={{ marginBottom:'1rem' }}>
                        <label style={labelStyle}>Device Type</label>
                        <select value={form.type} onChange={e=>setType(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }}>
                            {Object.entries(DEVICE_TYPE_META).map(([k,v]) => (
                                <option key={k} value={k}>{v.icon} {v.label}</option>
                            ))}
                        </select>
                        <small style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>Protocol: {meta.protocol}{meta.defaultPort ? ` (default port: ${meta.defaultPort})` : ''}</small>
                    </div>

                    {/* Name + IP + Port */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                        <div>
                            <label style={labelStyle}>Friendly Name *</label>
                            <input style={inputStyle} placeholder="e.g. Main-Firewall-01" value={form.name} onChange={e=>set('name',e.target.value)} required/>
                        </div>
                        <div>
                            <label style={labelStyle}>IP Address / Hostname *</label>
                            <input style={inputStyle} placeholder="192.168.1.x" value={form.ip} onChange={e=>set('ip',e.target.value)} required/>
                        </div>
                    </div>

                    {/* Port field — shown for SSH and SNMP devices */}
                    {meta.defaultPort && (
                        <div style={{ marginBottom:'1rem' }}>
                            <label style={labelStyle}>
                                {meta.authFields.includes('port') ? 'SSH Port' : 'Port'}
                                <span style={{ color:'var(--text-muted)', fontWeight:400 }}> (default: {meta.defaultPort})</span>
                            </label>
                            <input
                                type="number"
                                style={{ ...inputStyle, width:'160px' }}
                                placeholder={String(meta.defaultPort)}
                                value={form.port}
                                onChange={e=>set('port', e.target.value)}
                            />
                            {meta.authFields.includes('port') && (
                                <small style={{ color:'var(--text-muted)', fontSize:'0.75rem', display:'block', marginTop:'4px' }}>
                                    ⓘ Change if your SSH daemon runs on a non-standard port (e.g. 2222)
                                </small>
                            )}
                        </div>
                    )}

                    {/* Auth fields based on type */}
                    {meta.authFields.includes('username') && (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                            <div>
                                <label style={labelStyle}>Username</label>
                                <input style={inputStyle} placeholder="admin" value={form.auth.username} onChange={e=>setAuth('username',e.target.value)}/>
                            </div>
                            <div>
                                <label style={labelStyle}>Password / SSH Key</label>
                                <div style={{ position:'relative' }}>
                                    <input type={showPwd?'text':'password'} style={{ ...inputStyle, paddingRight:'2rem' }} placeholder="••••••" value={form.auth.password} onChange={e=>setAuth('password',e.target.value)}/>
                                    <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute', right:'8px', top:'8px', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                                        {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {meta.authFields.includes('community') && (
                        <div style={{ marginBottom:'1rem' }}>
                            <label style={labelStyle}>SNMP Community String</label>
                            <input style={inputStyle} placeholder="public" value={form.auth.community} onChange={e=>setAuth('community',e.target.value)}/>
                            <small style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>⚠ Change "public" to your actual community string. Default "public" is a security risk.</small>
                        </div>
                    )}

                    {meta.authFields.includes('apiToken') && (
                        <div style={{ marginBottom:'1rem' }}>
                            <label style={labelStyle}>API Token</label>
                            <input type="password" style={inputStyle} placeholder="Enter REST API token" value={form.auth.apiToken} onChange={e=>setAuth('apiToken',e.target.value)}/>
                            <small style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>
                                {form.type === 'fortinet' ? 'Create at: FortiGate Admin → System → API' : 'Create at: Panorama → Device → API Key'}
                            </small>
                        </div>
                    )}

                    <button type="submit" style={{ width:'100%', padding:'0.75rem', background:'linear-gradient(135deg, var(--primary), var(--accent-cyan))', border:'none', borderRadius:'8px', color:'white', fontWeight:600, cursor:'pointer', marginTop:'0.5rem' }}>
                        + Add Device
                    </button>
                </form>
            </div>
        </div>
    );
}

function DeviceCard({ device, onDelete, onScan, scanResult }) {
    const [expanded, setExpanded] = useState(false);
    const meta = DEVICE_TYPE_META[device.type] || DEVICE_TYPE_META.linux;
    const statusColor = STATUS_COLORS[device._status || 'idle'];
    const hasError = !!device.lastScanError;
    const hasResult = !!device.lastScan;

    return (
        <div style={{ background:'rgba(0,0,0,0.3)', border:`1px solid ${hasError ? '#ef4444' : hasResult ? statusColor : 'rgba(255,255,255,0.05)'}`, borderRadius:'10px', overflow:'hidden', transition:'all 0.2s' }}>
            <div style={{ padding:'1rem', display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer' }} onClick={()=>setExpanded(!expanded)}>
                <div style={{ fontSize:'1.8rem', lineHeight:1 }}>{meta.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'0.95rem', marginBottom:'2px', display:'flex', alignItems:'center', gap:'8px' }}>
                        {device.name}
                        <span style={{ fontSize:'0.7rem', background:`${meta.color}22`, color:meta.color, padding:'2px 8px', borderRadius:'12px', border:`1px solid ${meta.color}44` }}>{meta.label}</span>
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', display:'flex', gap:'16px' }}>
                        <span>📍 {device.ip}</span>
                        <span>🔌 {meta.protocol}</span>
                        {device.lastScanAt && <span>🕒 {new Date(device.lastScanAt).toLocaleTimeString()}</span>}
                    </div>
                </div>

                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    {device._status === 'scanning' ? (
                        <Loader size={16} className="spin" style={{ color:'#f59e0b' }}/>
                    ) : hasError ? (
                        <AlertCircle size={16} color="#ef4444"/>
                    ) : hasResult ? (
                        <CheckCircle size={16} color="#10b981"/>
                    ) : (
                        <div style={{ width:8, height:8, borderRadius:'50%', background:'#64748b'}}/>
                    )}

                    <button
                        onClick={e=>{ e.stopPropagation(); onScan(device.id); }}
                        disabled={device._status === 'scanning'}
                        style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', padding:'4px 12px', borderRadius:'6px', color:'var(--accent-cyan)', cursor:'pointer', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'4px' }}
                    >
                        {device._status === 'scanning' ? <><Loader size={12} className="spin"/> Scanning...</> : <><Play size={12}/> Scan</>}
                    </button>

                    <button onClick={e=>{ e.stopPropagation(); onDelete(device.id); }} style={{ background:'transparent', border:'none', color:'#ef4444', cursor:'pointer', padding:'4px' }}>
                        <Trash2 size={14}/>
                    </button>

                    {expanded ? <ChevronUp size={16} color="var(--text-muted)"/> : <ChevronDown size={16} color="var(--text-muted)"/>}
                </div>
            </div>

            {expanded && (
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'1rem', fontSize:'0.85rem' }}>
                    {hasError && (
                        <div style={{ color:'#ef4444', background:'rgba(239,68,68,0.1)', padding:'0.75rem', borderRadius:'6px', marginBottom:'0.75rem' }}>
                            ⚠ Scan Error: {device.lastScanError}
                        </div>
                    )}
                    {hasResult && !hasError && (
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'0.75rem' }}>
                            {[
                                ['⏱ Uptime', device.lastScan.uptime || 'N/A'],
                                ['🔥 Firewall', device.lastScan.firewall?.status || 'N/A'],
                                ['🔐 Failed Logins', device.lastScan.access?.failedLogins ?? 'N/A'],
                                ['🩹 Patches', device.lastScan.patching?.pendingUpdates != null ? `${device.lastScan.patching.pendingUpdates} pending` : 'N/A'],
                                ['💾 Backup', device.lastScan.backup?.status || 'N/A'],
                                ['💿 Disk', `${device.lastScan.resources?.diskUsedPercent ?? 'N/A'}%`],
                            ].map(([label, val]) => (
                                <div key={label} style={{ background:'rgba(0,0,0,0.3)', padding:'0.5rem 0.75rem', borderRadius:'6px' }}>
                                    <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginBottom:'2px' }}>{label}</div>
                                    <div style={{ fontWeight:500 }}>{val}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!hasResult && !hasError && (
                        <div style={{ color:'var(--text-muted)', textAlign:'center', padding:'1rem' }}>No scan results yet. Click "Scan" to run diagnostics.</div>
                    )}
                </div>
            )}
        </div>
    );
}

const DeviceManager = ({ onScanComplete, onChecklistUpdate }) => {
    const [devices, setDevices] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isScanningAll, setIsScanningAll] = useState(false);
    const [scanStatus, setScanStatus] = useState('');

    // No longer fetching checklist here; let parent do it via onScanComplete

    const loadDevices = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/devices`);
            const data = await res.json();
            setDevices(Array.isArray(data) ? data : []);
        } catch {
            console.error('Could not load devices — is the backend running on port 3001?');
        }
    }, []);

    useEffect(() => {
        loadDevices();
    }, [loadDevices]);

    const handleAdd = async (form) => {
        try {
            await fetch(`${API_BASE}/api/devices`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
            setShowAddModal(false);
            loadDevices();
        } catch (e) { alert('Failed to add device: ' + e.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this device?')) return;
        await fetch(`${API_BASE}/api/devices/${id}`, { method:'DELETE' });
        loadDevices();
    };

    const handleScanOne = async (id) => {
        setDevices(prev => prev.map(d => d.id === id ? { ...d, _status:'scanning' } : d));
        try {
            const res = await fetch(`${API_BASE}/api/devices/${id}/scan`, { method:'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setDevices(prev => prev.map(d => d.id === id ? { ...d, _status:'success', lastScan:data, lastScanError:null, lastScanAt: new Date().toISOString() } : d));
            // Auto-fill checklist via parent
            if (onScanComplete) onScanComplete();
        } catch (e) {
            setDevices(prev => prev.map(d => d.id === id ? { ...d, _status:'error', lastScanError:e.message } : d));
        }
    };

    const handleScanAll = async () => {
        setIsScanningAll(true);
        setScanStatus('Scanning all devices...');
        setDevices(prev => prev.map(d => ({ ...d, _status:'scanning' })));

        try {
            const res = await fetch(`${API_BASE}/api/devices/scan-all`, { method:'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Scan failed');

            // Update device statuses from results
            setDevices(prev => prev.map(d => {
                const summary = data.deviceSummaries?.find(s => s.id === d.id);
                return { ...d,
                    _status: summary?.error ? 'error' : 'success',
                    lastScanError: summary?.error || null,
                    lastScanAt: new Date().toISOString(),
                };
            }));

            setScanStatus(`✓ Scan complete — ${data.devicesOnline}/${data.devicesScanned} devices online | ${data.checklist?.filter(t=>t.completed).length}/${data.checklist?.length} checklist items auto-filled`);

            // Trigger parent refresh
            if (onScanComplete) onScanComplete();
        } catch (e) {
            setScanStatus('✗ Scan failed: ' + e.message);
            setDevices(prev => prev.map(d => ({ ...d, _status: d._status === 'scanning' ? 'error' : d._status })));
        } finally {
            setIsScanningAll(false);
        }
    };

    return (
        <div style={{ marginBottom:'2rem' }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
                <div>
                    <h2 style={{ margin:0, fontSize:'1.3rem', display:'flex', alignItems:'center', gap:'8px' }}>
                        <Server size={20} color="var(--accent-cyan)"/> Device Registry
                        <span style={{ fontSize:'0.8rem', background:'rgba(255,255,255,0.1)', padding:'2px 10px', borderRadius:'12px', color:'var(--text-muted)' }}>{devices.length} devices</span>
                    </h2>
                    <p style={{ margin:'4px 0 0', fontSize:'0.85rem', color:'var(--text-muted)' }}>Add devices to auto-fill your security checklist. Supports Linux, Windows, SNMP, FortiGate, Palo Alto, ISP links.</p>
                </div>
                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                    <button
                        onClick={handleScanAll}
                        disabled={isScanningAll || devices.length === 0}
                        style={{ display:'flex', alignItems:'center', gap:'6px', padding:'0.6rem 1.25rem', background:'linear-gradient(135deg, var(--primary), var(--accent-cyan))', border:'none', borderRadius:'8px', color:'white', fontWeight:600, cursor: isScanningAll ? 'wait' : 'pointer', opacity: devices.length === 0 ? 0.5 : 1, fontSize:'0.9rem' }}
                    >
                        {isScanningAll ? <><RefreshCw size={16} className="spin"/> Scanning All...</> : <><Play size={16}/> Scan All Devices</>}
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{ display:'flex', alignItems:'center', gap:'6px', padding:'0.6rem 1.25rem', background:'transparent', border:'1px solid var(--primary)', borderRadius:'8px', color:'var(--primary)', fontWeight:600, cursor:'pointer', fontSize:'0.9rem' }}
                    >
                        <Plus size={16}/> Add Device
                    </button>
                </div>
            </div>

            {/* Scan Status Banner */}
            {scanStatus && (
                <div style={{ padding:'0.75rem 1rem', background: scanStatus.startsWith('✓') ? 'rgba(16,185,129,0.1)' : scanStatus.startsWith('✗') ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border:`1px solid ${scanStatus.startsWith('✓') ? '#10b981' : scanStatus.startsWith('✗') ? '#ef4444' : '#f59e0b'}`, borderRadius:'8px', marginBottom:'1.5rem', fontSize:'0.9rem', color: scanStatus.startsWith('✓') ? '#10b981' : scanStatus.startsWith('✗') ? '#ef4444' : '#f59e0b' }}>
                    {scanStatus}
                </div>
            )}

            {/* Device List */}
            {devices.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3rem', background:'rgba(0,0,0,0.2)', borderRadius:'12px', border:'2px dashed rgba(255,255,255,0.1)' }}>
                    <Server size={48} color="var(--text-muted)" style={{ marginBottom:'1rem' }}/>
                    <p style={{ color:'var(--text-muted)', margin:0 }}>No devices registered yet.</p>
                    <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginTop:'4px' }}>Click <strong>"Add Device"</strong> to add your Linux server, firewall, network switch, or ISP link.</p>
                </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    {devices.map(d => (
                        <DeviceCard key={d.id} device={d} onDelete={handleDelete} onScan={handleScanOne}/>
                    ))}
                </div>
            )}

            {showAddModal && <AddDeviceModal onClose={()=>setShowAddModal(false)} onAdd={handleAdd}/>}
        </div>
    );
};

export default DeviceManager;
