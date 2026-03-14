import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../Header';
import DesicrewLogo from '../Shared/DesicrewLogo';
import ProgressBar from '../ProgressBar';
import CategoryFilter from '../CategoryFilter';
import TaskList from '../TaskList';
import AutomationPanel from '../AutomationPanel';
import HistoryModal from './HistoryModal';
import ProfileModal from './ProfileModal';
import ExportManager from './ExportManager';
import DeviceManager from './DeviceManager';
import HomeDashboard from './HomeDashboard';
import AssetManagement from './AssetManagement';
import UserManagement from './UserManagement';
import EmailConfigModal from './EmailConfigModal';
import { INITIAL_TASKS, CATEGORIES } from '../../data/tasks';
import {
    Download, Terminal, Send, CheckCircle, AlertCircle, RefreshCw,
    Clock, LayoutDashboard, Server, ShieldCheck, User, Users, LogOut,
    Mail, ChevronRight, ChevronLeft, Settings, BarChart3, Bell, Home, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Use relative URLs so the app works on any host/port in production
const API_BASE = '';
const AUTO_REFRESH_INTERVAL_MS = 15000;

const SecurityChecklist = () => {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('antigravity_tasks_v2');
        return saved ? JSON.parse(saved) : INITIAL_TASKS;
    });

    // Navigation state
    const [activePage, setActivePage] = useState('home'); // home | checklist | devices | assets | history
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Modals
    const [showAutomation, setShowAutomation] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showEmailConfig, setShowEmailConfig] = useState(false);

    // Checklist state
    const [activeCategory, setActiveCategory] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [reportStatus, setReportStatus] = useState(null);
    const [reportMsg, setReportMsg] = useState('');
    const [lastScanMeta, setLastScanMeta] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Settings
    const [scannerSchedule, setScannerSchedule] = useState('off');
    const [nextScanAt, setNextScanAt] = useState(null);
    const [autoEmailEnabled, setAutoEmailEnabled] = useState(false);

    const autoRefreshRef = useRef(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const avatar = localStorage.getItem('secops_avatar');

    useEffect(() => {
        localStorage.setItem('antigravity_tasks_v2', JSON.stringify(tasks));
    }, [tasks]);

    const applyServerChecklist = useCallback((serverChecklist, scanMeta) => {
        if (!serverChecklist || !Array.isArray(serverChecklist)) return;
        if (scanMeta) setLastScanMeta(scanMeta);
        setLastRefreshed(new Date());
        setTasks(prev => prev.map(frontendTask => {
            const serverTask = serverChecklist.find(s => s.id === frontendTask.id);
            if (!serverTask) return frontendTask;
            if (serverTask.notes && serverTask.notes.length > 0) {
                return { ...frontendTask, completed: true, notes: `${serverTask.notes}` };
            }
            if (serverTask.completed) return { ...frontendTask, completed: true };
            return frontendTask;
        }));
    }, []);

    const fetchChecklist = useCallback(async (silent = false) => {
        if (!silent) setIsRefreshing(true);
        try {
            const res = await fetch(`${API_BASE}/api/checklist?_t=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            applyServerChecklist(data.checklist, data);
        } catch (e) {
            if (!silent) console.error('Checklist refresh failed:', e.message);
        } finally {
            if (!silent) setIsRefreshing(false);
        }
    }, [applyServerChecklist]);

    useEffect(() => {
        fetchChecklist(true);
        fetch(`${API_BASE}/api/settings`).then(r => r.json()).then(d => {
            setScannerSchedule(d.autoScanSchedule || 'off');
            setNextScanAt(d.nextScanAt || null);
            setAutoEmailEnabled(d.autoEmail === true);
        }).catch(() => {});
        const startInterval = () => {
            autoRefreshRef.current = setInterval(() => fetchChecklist(true), AUTO_REFRESH_INTERVAL_MS);
        };
        if (autoRefresh) startInterval();
        return () => clearInterval(autoRefreshRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh]);

    const handleScanComplete = () => fetchChecklist(false);
    const handleManualRefresh = () => fetchChecklist(false);
    const handleToggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const handleUpdateNotes = (id, notes) => setTasks(prev => prev.map(t => t.id === id ? { ...t, notes } : t));
    const handleLogout = () => { logout(); navigate('/login'); };

    const handleClearChecklist = async () => {
        if (!confirm('Clear the entire checklist? This cannot be undone.')) return;
        setTasks(INITIAL_TASKS.map(t => ({ ...t, completed: false, notes: '' })));
        setLastScanMeta(null);
        try { await fetch(`${API_BASE}/api/checklist/clear`, { method: 'POST' }); } catch(e){}
    };

    const handleScheduleChange = async (val) => {
        setScannerSchedule(val);
        try {
            const res = await fetch(`${API_BASE}/api/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autoScanSchedule: val }) });
            const data = await res.json();
            setNextScanAt(data.nextScanAt || null);
        } catch (err) { console.error('Failed to save schedule'); }
    };

    const handleAutoEmailChange = async (val) => {
        setAutoEmailEnabled(val);
        try {
            await fetch(`${API_BASE}/api/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autoEmail: val }) });
        } catch (err) { console.error('Failed to save email settings'); }
    };

    const handleSendReport = async () => {
        setReportStatus('sending'); setReportMsg('');
        try {
            const res = await fetch(`${API_BASE}/api/send-report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            applyServerChecklist(data.checklist || null, data);
            setReportStatus('success');
            setReportMsg(data.message || 'Report sent!');
        } catch (err) {
            setReportStatus('error');
            setReportMsg(err.message);
        }
        setTimeout(() => { setReportStatus(null); setReportMsg(''); }, 6000);
    };

    const handleChecklistUpdate = useCallback((serverChecklist, scanMeta) => {
        applyServerChecklist(serverChecklist, scanMeta);
    }, [applyServerChecklist]);

    const catFiltered = activeCategory === 'all' ? tasks : tasks.filter(t => t.category === activeCategory);
    const filteredTasks = statusFilter === 'all' ? catFiltered : statusFilter === 'completed' ? catFiltered.filter(t => t.completed) : catFiltered.filter(t => !t.completed);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const counts = tasks.reduce((acc, t) => { acc.total = (acc.total || 0) + 1; acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, { total: 0 });

    // ─── SIDEBAR ─────────────────────────────────────────────────────────
    const navItems = [
        { id: 'home', icon: <Home size={18}/>, label: 'Home' },
        { id: 'checklist', icon: <ShieldCheck size={18}/>, label: 'Security Checklist' },
        { id: 'devices', icon: <Server size={18}/>, label: 'Device Registry' },
        { id: 'assets', icon: <Activity size={18}/>, label: 'Asset Management' },
        { id: 'automation', icon: <Terminal size={18}/>, label: 'Automation Console' },
        { id: 'export', icon: <Download size={18}/>, label: 'Data Export' },
        { id: 'users', icon: <Users size={18}/>, label: 'User Management' },
    ];
    const actionNav = [
        { id: 'history', icon: <Clock size={18}/>, label: 'Scan History', action: () => setShowHistory(true) },
        { id: 'report', icon: <Mail size={18}/>, label: 'Send Email Report', action: () => setActivePage('report'), status: reportStatus },
    ];

    const sidebarW = sidebarCollapsed ? '60px' : '220px';

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>

            {/* ── Left Sidebar ── */}
            <div style={{ width: sidebarW, minWidth: sidebarW, background: 'rgba(0,0,0,0.5)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', overflow: 'hidden', flexShrink: 0 }}>

                {/* Sidebar header — logo + collapse */}
                <div style={{ padding: sidebarCollapsed ? '1.5rem 0' : '1rem', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '70px', position: 'relative' }}>
                    {!sidebarCollapsed ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                                <DesicrewLogo size="small" />
                                <button onClick={() => setSidebarCollapsed(true)} style={{ position: 'absolute', right: '0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Collapse sidebar">
                                    <ChevronLeft size={14}/>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '32px', height: '32px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', borderRadius: '4px' }}>
                                <img src="/desicrew.png" alt="Logo" style={{ height: '32px', objectFit: 'cover', objectPosition: 'left' }} />
                            </div>
                            <button onClick={() => setSidebarCollapsed(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Expand sidebar">
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    )}
                </div>

                {/* Scrollable Center Content */}
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Main Nav */}
                    <div style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setActivePage(item.id)} title={item.label}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: sidebarCollapsed ? '0.75rem 0' : '0.7rem 1rem', background: activePage === item.id ? 'rgba(139,92,246,0.15)' : 'transparent', border: 'none', borderLeft: activePage === item.id ? '2px solid var(--primary)' : '2px solid transparent', color: activePage === item.id ? 'white' : 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', transition: 'all 0.2s' }}>
                            <span style={{ color: activePage === item.id ? 'var(--accent-cyan)' : 'inherit', flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && <span style={{ fontSize: '0.88rem', fontWeight: activePage === item.id ? 600 : 400 }}>{item.label}</span>}
                        </button>
                    ))}
                </div>

                {/* Action Nav */}
                <div style={{ padding: '0.75rem 0' }}>
                    {!sidebarCollapsed && <div style={{ padding: '4px 1rem 8px', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>Actions</div>}
                    {actionNav.map(item => (
                        <button key={item.id} onClick={item.action} title={item.label}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: sidebarCollapsed ? '0.75rem 0' : '0.7rem 1rem', background: 'transparent', border: 'none', borderLeft: '2px solid transparent', color: item.status === 'success' ? '#10b981' : item.status === 'error' ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <span style={{ flexShrink: 0 }}>{item.icon}</span>
                            {!sidebarCollapsed && (
                                <span style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {item.label}
                                    {item.id === 'report' && item.status === 'sending' && <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Sending...</span>}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Auto-Scan Settings */}
                {!sidebarCollapsed && (
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Auto-Scan</div>
                        <select value={scannerSchedule} onChange={e => handleScheduleChange(e.target.value)}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '8px' }}>
                            <option value="off">Off (Manual)</option>
                            <option value="15min">Every 15 min</option>
                            <option value="hourly">Every Hour</option>
                            <option value="daily">Daily (8 AM)</option>
                            <option value="weekly">Weekly (Mon 8 AM)</option>
                        </select>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '8px' }}>
                            <input type="checkbox" checked={autoEmailEnabled} onChange={e => handleAutoEmailChange(e.target.checked)} style={{ accentColor: 'var(--primary)' }}/>
                            Auto-email on scan
                        </label>
                        {scannerSchedule !== 'off' && nextScanAt && (
                            <div style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                ⏱️ Next: {nextScanAt}
                            </div>
                        )}
                    </div>
                )}
                </div>

                {/* Fixed Footer (Profile/Logout) */}
                <div style={{ padding: sidebarCollapsed ? '0.75rem 0' : '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', flexShrink: 0, paddingBottom: '1.5rem' }}>
                    {/* Profile button */}
                    <button onClick={() => setShowProfile(true)} title="Profile"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: sidebarCollapsed ? '0.5rem 0' : '0.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', marginBottom: '4px', borderRadius: '6px' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--primary)', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <User size={16} color="var(--primary)"/>}
                        </div>
                        {!sidebarCollapsed && (
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.82rem', color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.role || 'Administrator'}</div>
                            </div>
                        )}
                    </button>
                    {/* Logout */}
                    <button onClick={handleLogout} title="Logout"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: sidebarCollapsed ? '0.5rem 0' : '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.82rem', borderRadius: '6px', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <LogOut size={15}/>
                        {!sidebarCollapsed && 'Logout'}
                    </button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Top bar */}
                <div style={{ padding: '0 1.5rem', height: '64px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '2px', height: '36px', background: 'linear-gradient(180deg,#7c3aed,#06b6d4)', borderRadius: '2px', flexShrink: 0 }}/>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ 
                                    fontSize: '1.6rem', 
                                    fontWeight: 900, 
                                    background: 'linear-gradient(to bottom, #ffffff, #e0e7ff)', 
                                    WebkitBackgroundClip: 'text', 
                                    WebkitTextFillColor: 'transparent',
                                    letterSpacing: '2px',
                                    textShadow: '0 0 15px rgba(255,255,255,0.2)'
                                }}>SECOPS</div>
                                <div style={{ padding: '5px 14px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '20px', fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600, display: 'flex', alignItems: 'center', letterSpacing: '0.5px', boxShadow: '0 0 10px rgba(139,92,246,0.1)' }}>
                                    {activePage === 'home' && 'Home Dashboard'}
                                    {activePage === 'checklist' && '🛡️ Security Checklist'}
                                    {activePage === 'devices' && '📡 Device Registry'}
                                    {activePage === 'assets' && '📊 Asset Management'}
                                    {activePage === 'automation' && '⚡ Automation Console'}
                                    {activePage === 'users' && '👥 User Management'}
                                </div>
                            </div>
                            {lastRefreshed && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.8 }}>Last synced: {lastRefreshed.toLocaleTimeString()}</div>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Report status banner inline */}
                        {reportMsg && (
                            <div style={{ fontSize: '0.8rem', color: reportStatus === 'success' ? '#10b981' : '#ef4444', background: reportStatus === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${reportStatus === 'success' ? '#10b981' : '#ef4444'}`, padding: '4px 10px', borderRadius: '6px' }}>
                                {reportMsg}
                            </div>
                        )}
                        {/* UI auto-refresh toggle */}
                        <label title="Auto-refresh UI every 15s" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} style={{ accentColor: 'var(--primary)' }}/>
                            Auto-refresh
                        </label>
                        {activePage === 'checklist' && (
                            <button onClick={handleManualRefresh} disabled={isRefreshing}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.4)', background: isRefreshing ? 'rgba(139,92,246,0.15)' : 'transparent', color: '#a78bfa', cursor: isRefreshing ? 'wait' : 'pointer', fontSize: '0.8rem' }}>
                                <RefreshCw size={12} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}/> Refresh
                            </button>
                        )}
                    </div>
                </div>

                {/* Page content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {activePage === 'checklist' && (
                        <>
                            <ProgressBar total={totalTasks} completed={completedTasks} onClear={handleClearChecklist}/>

                            {lastScanMeta && (
                                <div style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', color: '#06b6d4', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span>📡 Devices: {lastScanMeta.devicesOnline}/{lastScanMeta.devicesScanned} online</span>
                                    <span>✓ Auto-filled: {lastScanMeta.completed ?? completedTasks}/{totalTasks} tasks</span>
                                    <span>🕒 Scan: {lastScanMeta.scanDate || '—'}</span>
                                </div>
                            )}


                            {/* ── Dashboard KPI Cards ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.875rem', marginBottom: '1.25rem' }}>
                                {[
                                    { label: 'Total Tasks', value: totalTasks, icon: '📋', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.25)' },
                                    { label: 'Completed', value: completedTasks, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
                                    { label: 'Pending', value: totalTasks - completedTasks, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
                                    { label: 'Completion Rate', value: `${Math.round((completedTasks/totalTasks)*100)}%`, icon: '📊', color: completedTasks/totalTasks >= 0.8 ? '#10b981' : completedTasks/totalTasks >= 0.5 ? '#f59e0b' : '#ef4444', bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.25)' },
                                    { label: 'Failed Logins', value: lastScanMeta ? (tasks.reduce((a, t) => a + (t.notes?.match?.(/Failed Logins: (\d+)/) ? parseInt(t.notes.match(/Failed Logins: (\d+)/)?.[1] || 0) : 0), 0) || '—') : '—', icon: '🔐', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
                                    { label: 'Devices Online', value: lastScanMeta ? `${lastScanMeta.devicesOnline}/${lastScanMeta.devicesScanned}` : '—', icon: '📡', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
                                ].map(card => (
                                    <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ fontSize: '1.4rem' }}>{card.icon}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color }}>{card.value}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
                                    </div>
                                ))}
                            </div>

                            <CategoryFilter categories={CATEGORIES} activeCategory={activeCategory} onSelect={setActiveCategory} counts={counts}/>

                            <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '400px', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{activeCategory === 'all' ? 'All Security Tasks' : activeCategory}</h2>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {[
                                            { key: 'all', label: `All (${catFiltered.length})`, color: 'var(--text-muted)' },
                                            { key: 'completed', label: `✓ Done (${catFiltered.filter(t=>t.completed).length})`, color: '#10b981' },
                                            { key: 'pending', label: `⏳ Pending (${catFiltered.filter(t=>!t.completed).length})`, color: '#f59e0b' },
                                        ].map(f => (
                                            <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{ padding: '4px 12px', borderRadius: '16px', border: `1px solid ${statusFilter === f.key ? f.color : 'rgba(255,255,255,0.1)'}`, background: statusFilter === f.key ? `${f.color}22` : 'transparent', color: statusFilter === f.key ? f.color : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: statusFilter === f.key ? 600 : 400 }}>
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <TaskList tasks={filteredTasks} onToggle={handleToggleTask} onUpdateNotes={handleUpdateNotes}/>
                            </div>
                        </>
                    )}

                    {activePage === 'devices' && (
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <DeviceManager onScanComplete={handleScanComplete} onChecklistUpdate={handleChecklistUpdate}/>
                        </div>
                    )}

                    {activePage === 'home' && (
                        <HomeDashboard onNavigate={setActivePage} />
                    )}

                    {activePage === 'assets' && (
                        <AssetManagement />
                    )}

                    {activePage === 'automation' && (
                        <AutomationPanel />
                    )}

                    {activePage === 'export' && (
                        <div className="glass-panel" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <ExportManager fullChecklist={tasks} />
                        </div>
                    )}

                    {activePage === 'users' && (
                        <div className="glass-panel" style={{ padding: '1.5rem', margin: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <UserManagement />
                        </div>
                    )}

                    {activePage === 'report' && (
                        <div className="glass-panel" style={{ padding: '1.5rem', margin: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <EmailConfigModal onClose={() => setActivePage('home')} />
                        </div>
                    )}

                    <footer style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', paddingBottom: '1rem', fontSize: '0.78rem' }}>
                        SECOPS // SECURITY OPERATIONS CENTER &nbsp;|&nbsp; v3.0.0
                    </footer>
                </div>
            </div>

            {/* Modals */}
            <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)}/>
            <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)}/>
        </div>
    );
};

export default SecurityChecklist;
