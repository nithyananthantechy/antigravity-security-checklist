import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, FileText, Download, CheckCircle, AlertTriangle, Filter, Search } from 'lucide-react';

const API_BASE = `http://${window.location.hostname}:3001`;

const HistoryModal = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState([]);
    const [devices, setDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDevice, setFilterDevice] = useState('all');
    const [filterTrigger, setFilterTrigger] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setIsLoading(true);
        Promise.all([
            fetch(`${API_BASE}/api/history`).then(r => r.json()),
            fetch(`${API_BASE}/api/devices`).then(r => r.json()),
        ]).then(([hist, devs]) => {
            setHistory(Array.isArray(hist) ? hist.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : []);
            setDevices(Array.isArray(devs) ? devs : []);
        }).catch(console.error)
          .finally(() => setIsLoading(false));
    }, [isOpen]);

    const deviceNameMap = useMemo(() => {
        const m = {};
        devices.forEach(d => { m[d.id] = d.name; });
        return m;
    }, [devices]);

    const triggerLabels = {
        manual_single: 'Manual Single',
        bulk_scan: 'Bulk Scan',
        manual_report: 'Manual Report',
        scheduled: 'Scheduled',
    };

    const filtered = useMemo(() => {
        return history.filter(e => {
            if (filterDevice !== 'all' && e.deviceId !== filterDevice) return false;
            if (filterTrigger !== 'all' && e.scanType !== filterTrigger) return false;
            if (filterDate) {
                const entryDate = new Date(e.timestamp).toISOString().slice(0, 10);
                if (entryDate !== filterDate) return false;
            }
            if (searchText) {
                const name = (deviceNameMap[e.deviceId] || '').toLowerCase();
                if (!name.includes(searchText.toLowerCase()) && !e.deviceId.toLowerCase().includes(searchText.toLowerCase())) return false;
            }
            return true;
        });
    }, [history, filterDevice, filterTrigger, filterDate, searchText, deviceNameMap]);

    const handleExportCSV = () => {
        const headers = ['Timestamp', 'Device Name', 'Device ID', 'Trigger', 'Status', 'OS/Type', 'Firewall', 'Patching', 'Failed Logins', 'Error'];
        const rows = filtered.map(e => [
            new Date(e.timestamp).toLocaleString(),
            deviceNameMap[e.deviceId] || e.deviceId,
            e.deviceId,
            triggerLabels[e.scanType] || e.scanType,
            e.error ? 'Failed' : 'Success',
            e.result?.deviceType || '',
            e.result?.firewall?.status || '',
            e.result?.patching?.status || '',
            e.result?.access?.failedLogins ?? '',
            e.error || '',
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `scan_history_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    if (!isOpen) return null;

    const selectStyle = {
        background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)',
        color:'white', borderRadius:'6px', padding:'6px 10px', fontSize:'0.82rem', cursor:'pointer'
    };

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div className="glass-panel" style={{ width:'100%', maxWidth:'950px', height:'85vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

                {/* Header */}
                <div style={{ padding:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                        <h2 style={{ margin:0, fontSize:'1.4rem', display:'flex', alignItems:'center', gap:'8px' }}>
                            <Clock size={22} color="var(--accent-cyan)"/> Scan History & Audit Log
                        </h2>
                        <p style={{ margin:'4px 0 0', color:'var(--text-muted)', fontSize:'0.85rem' }}>
                            {filtered.length} records found{filtered.length !== history.length ? ` (of ${history.length} total)` : ''}
                        </p>
                    </div>
                    <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                        <button onClick={handleExportCSV} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(16,185,129,0.15)', border:'1px solid #10b981', color:'#10b981', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem', fontWeight:600 }}>
                            <Download size={15}/> Export CSV
                        </button>
                        <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                            <X size={24}/>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center', background:'rgba(0,0,0,0.2)' }}>
                    <Filter size={14} color="var(--text-muted)"/>
                    <div style={{ position:'relative' }}>
                        <Search size={12} style={{ position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                        <input
                            type="text" placeholder="Search device..." value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ ...selectStyle, paddingLeft:'28px', width:'160px' }}
                        />
                    </div>
                    <select style={selectStyle} value={filterDevice} onChange={e => setFilterDevice(e.target.value)}>
                        <option value="all">All Devices</option>
                        {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select style={selectStyle} value={filterTrigger} onChange={e => setFilterTrigger(e.target.value)}>
                        <option value="all">All Triggers</option>
                        {Object.entries(triggerLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                        style={{ ...selectStyle, colorScheme:'dark' }}/>
                    {(filterDevice !== 'all' || filterTrigger !== 'all' || filterDate || searchText) && (
                        <button onClick={() => { setFilterDevice('all'); setFilterTrigger('all'); setFilterDate(''); setSearchText(''); }}
                            style={{ background:'none', border:'1px solid rgba(239,68,68,0.4)', color:'#ef4444', padding:'4px 10px', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem' }}>
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Content */}
                <div style={{ flex:1, overflowY:'auto', padding:'1.5rem' }}>
                    {isLoading ? (
                        <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)' }}>Loading historical data...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)' }}>
                            <FileText size={48} style={{ opacity:0.4, marginBottom:'1rem', display:'block', margin:'0 auto 1rem' }}/>
                            <p>No records match your filters.</p>
                        </div>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                            {filtered.map((entry, idx) => (
                                <div key={idx} style={{ background:'rgba(0,0,0,0.3)', border:`1px solid ${entry.error ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.15)'}`, borderRadius:'8px', padding:'1rem' }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.5rem' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                            {entry.error ? <AlertTriangle size={18} color="#ef4444"/> : <CheckCircle size={18} color="#10b981"/>}
                                            <div>
                                                <div style={{ fontWeight:600 }}>
                                                    {deviceNameMap[entry.deviceId] || entry.deviceId}
                                                </div>
                                                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'2px' }}>
                                                    ID: {entry.deviceId}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign:'right' }}>
                                            <div style={{ fontSize:'0.85rem', color:'#06b6d4' }}>
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </div>
                                            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', marginTop:'2px' }}>
                                                {triggerLabels[entry.scanType] || entry.scanType}
                                            </div>
                                        </div>
                                    </div>

                                    {entry.error ? (
                                        <div style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', padding:'8px 12px', borderRadius:'4px', fontSize:'0.85rem' }}>
                                            ⚠ Scan Failed: {entry.error}
                                        </div>
                                    ) : (
                                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'0.5rem' }}>
                                            {[
                                                ['OS/Type', entry.result?.deviceType],
                                                ['Firewall', entry.result?.firewall?.status],
                                                ['Patching', entry.result?.patching?.status],
                                                ['Failed Logins', entry.result?.access?.failedLogins],
                                                ['Disk Used', entry.result?.resources?.diskUsedPercent != null ? `${entry.result.resources.diskUsedPercent}%` : null],
                                                ['WAN Quality', entry.result?.wan?.quality],
                                            ].filter(([, v]) => v != null && v !== '').map(([label, val]) => (
                                                <div key={label} style={{ background:'rgba(255,255,255,0.03)', padding:'6px 10px', borderRadius:'4px' }}>
                                                    <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{label}</div>
                                                    <div style={{ fontSize:'0.82rem', fontWeight:500 }}>{String(val)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
