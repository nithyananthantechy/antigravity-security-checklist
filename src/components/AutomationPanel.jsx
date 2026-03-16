import React, { useState, useEffect, useRef } from 'react';
import {
    Terminal, Copy, Check, Play, Server, Loader, AlertTriangle,
    CheckCircle, RefreshCw, Mail, ShieldCheck, Eye, EyeOff, X
} from 'lucide-react';
import { SCRIPTS } from '../data/automationScripts';

const API_BASE = `http://${window.location.hostname}:3001`;

const BASH_SCRIPTS = [
    {
        id: 'system-info',
        title: 'System Overview',
        category: 'linux',
        description: 'Shows OS, uptime, hostname, CPU, RAM, and disk usage.',
        icon: '🖥️',
        command: `echo "=== SYSTEM INFO ===" && uname -a && echo "" && echo "=== UPTIME ===" && uptime && echo "" && echo "=== MEMORY ===" && free -h && echo "" && echo "=== DISK USAGE ===" && df -h / && echo "" && echo "=== CPU LOAD ===" && top -bn1 | grep "Cpu(s)" | head -1`,
    },
    {
        id: 'failed-logins',
        title: 'Failed Login Attempts',
        category: 'linux',
        description: 'Shows last 20 failed SSH login attempts.',
        icon: '🔐',
        command: `grep "Failed password" /var/log/auth.log 2>/dev/null | tail -20 || grep "Failed password" /var/log/secure 2>/dev/null | tail -20 || echo "No auth log access"`,
    },
    {
        id: 'open-ports',
        title: 'Open Ports & Services',
        category: 'linux',
        description: 'Lists all active listening ports and the processes bound to them.',
        icon: '🔌',
        command: `ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null || echo "No ss/netstat available"`,
    },
    {
        id: 'patch-check',
        title: 'Pending Security Updates',
        category: 'linux',
        description: 'Checks for available security updates via apt or yum.',
        icon: '🩹',
        command: `apt list --upgradable 2>/dev/null | grep -i security | head -20 || yum check-update --security 2>/dev/null | head -20 || echo "No package manager found"`,
    },
    {
        id: 'top-processes',
        title: 'Top Resource Processes',
        category: 'linux',
        description: 'Shows the top CPU and memory consuming processes.',
        icon: '📊',
        command: `echo "=== TOP 10 CPU PROCESSES ===" && ps aux --sort=-%cpu | head -11 && echo "" && echo "=== TOP 10 MEM PROCESSES ===" && ps aux --sort=-%mem | head -11`,
    },
    {
        id: 'firewall-rules',
        title: 'Firewall Rules Status',
        category: 'linux',
        description: 'Shows current UFW or iptables firewall rules.',
        icon: '🔥',
        command: `ufw status verbose 2>/dev/null || iptables -L -n --line-numbers 2>/dev/null | head -40 || echo "No firewall tool available"`,
    },
    {
        id: 'suspicious-crons',
        title: 'Cron Job Audit',
        category: 'linux',
        description: 'Audits all system-level cron jobs that may indicate persistence.',
        icon: '⏰',
        command: `echo "=== SYSTEM CRON ===" && ls -la /etc/cron* 2>/dev/null && echo "" && echo "=== ALL CRONTABS ===" && for u in $(cut -d: -f1 /etc/passwd); do crontab -l -u $u 2>/dev/null | grep -v "^#" | grep . && echo "  (user: $u)"; done || echo "Done"`,
    },
    {
        id: 'last-logins',
        title: 'Recent Login History',
        category: 'linux',
        description: 'Shows last 15 successful SSH login sessions.',
        icon: '📋',
        command: `last -15 2>/dev/null || echo "last command not available"`,
    },
    {
        id: 'py-sysinfo',
        title: 'System Info (Python)',
        category: 'python',
        description: 'Run Python script to get basic OS info',
        icon: '🐍',
        command: `python3 -c "import platform, psutil; print(f'OS: {platform.system()} {platform.release()}'); print(f'CPU: {psutil.cpu_percent()}%'); print(f'RAM: {psutil.virtual_memory().percent}%');" 2>/dev/null || echo "Python3 or psutil missing"`,
    },
    {
        id: 'py-ports',
        title: 'Active Conns (Python)',
        category: 'python',
        description: 'List ESTABLISHED connections via psutil',
        icon: '🔌',
        command: `python3 -c "import psutil; [print(f'{c.laddr.ip}:{c.laddr.port} -> {c.raddr[0] if c.raddr else '*'} ({c.status})') for c in psutil.net_connections() if c.status == 'ESTABLISHED']" 2>/dev/null || echo "Python3 or psutil missing"`,
    },
    {
        id: 'net-ping',
        title: 'Ping Sweep Subnet',
        category: 'network',
        description: 'Ping sweep the local /24 subnet (Linux/Mac)',
        icon: '📡',
        command: `for ip in $(seq 1 254); do ping -c 1 -W 1 192.168.1.$ip | grep "bytes from" & done`,
    },
    {
        id: 'net-cisco-int',
        title: 'Show IP Int Brief',
        category: 'network',
        description: 'Show IP interfaces (requires Cisco SSH)',
        icon: '🔌',
        command: `show ip int brief`,
    },
    {
        id: 'net-forti-sys',
        title: 'Get System Info',
        category: 'network',
        description: 'Show system status (FortiOS)',
        icon: '🛡️',
        command: `get system status`,
    },
    ...SCRIPTS.map(s => ({ ...s, category: 'windows', icon: '🪟', command: s.code }))
];

const AutomationPanel = () => {
    const [activeScriptId, setActiveScriptId] = useState('system-info');
    const [copied, setCopied] = useState(false);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [output, setOutput] = useState(null);    // { stdout, stderr, exitCode, error }
    const [isRunning, setIsRunning] = useState(false);
    const [customCmd, setCustomCmd] = useState('');
    const [emailTestResult, setEmailTestResult] = useState(null);
    const [emailTesting, setEmailTesting] = useState(false);
    const outputRef = useRef(null);
    const [categoryFilter, setCategoryFilter] = useState('linux');

    useEffect(() => {
        fetch(`${API_BASE}/api/devices`)
            .then(r => r.json())
            .then(data => {
                const availableDevs = Array.isArray(data) ? data.filter(d => ['linux', 'macos', 'ubuntusrv', 'snmp', 'fortinet', 'paloalto'].includes(d.type)) : [];
                setDevices(availableDevs);
                if (availableDevs.length > 0 && !selectedDeviceId) setSelectedDeviceId(availableDevs[0].id);
            }).catch(() => {});
    }, []);

    useEffect(() => {
        if (output && outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, [output]);

    const filteredScripts = BASH_SCRIPTS.filter(s => s.category === categoryFilter);
    const activeScript = BASH_SCRIPTS.find(s => s.id === activeScriptId) || filteredScripts[0];

    const handleCopy = () => {
        navigator.clipboard.writeText(activeScript.command || activeScript.code || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRun = async () => {
        if (!selectedDeviceId) return alert('Please select a target device first.');
        const cmd = customCmd.trim() || activeScript.command;
        if (!cmd) return;

        setIsRunning(true);
        setOutput(null);
        try {
            const res = await fetch(`${API_BASE}/api/run-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: selectedDeviceId, command: cmd }),
            });
            const data = await res.json();
            if (!res.ok) setOutput({ error: data.error });
            else setOutput(data);
        } catch (e) {
            setOutput({ error: e.message });
        } finally {
            setIsRunning(false);
        }
    };

    const handleTestEmail = async () => {
        setEmailTesting(true);
        setEmailTestResult(null);
        try {
            const res = await fetch(`${API_BASE}/api/test-email`, { method: 'POST' });
            const data = await res.json();
            setEmailTestResult(data);
        } catch (e) {
            setEmailTestResult({ error: e.message });
        } finally {
            setEmailTesting(false);
        }
    };

    const outputText = output?.error
        ? `ERROR: ${output.error}`
        : [output?.stdout, output?.stderr ? `[STDERR]\n${output.stderr}` : ''].filter(Boolean).join('\n').trim() || '(no output)';

    return (
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding:'0 0 1rem 0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                    <Terminal size={20} color="var(--accent-cyan)"/>
                    <span style={{ fontWeight:700, letterSpacing:'1px', fontSize:'1rem', color: 'white' }}>AUTOMATION CONSOLE v2.0</span>
                </div>

                    <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
                        {/* Device Selector */}
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(6,182,212,0.3)', borderRadius:'8px', padding:'4px 12px' }}>
                            <Server size={14} color="#06b6d4"/>
                            <select
                                value={selectedDeviceId}
                                onChange={e => setSelectedDeviceId(e.target.value)}
                                style={{ background:'transparent', border:'none', color:'#06b6d4', fontSize:'0.85rem', cursor:'pointer', outline:'none' }}
                            >
                                {devices.length === 0 ? (
                                    <option value="">No Linux devices found</option>
                                ) : (
                                    devices.map(d => <option key={d.id} value={d.id} style={{ background:'#0f1624' }}>{d.name} ({d.ip})</option>)
                                )}
                            </select>
                        </div>

                        {/* Test Email */}
                        <button onClick={handleTestEmail} disabled={emailTesting}
                            title="Test SMTP email connection"
                            style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.4)', color:'#a78bfa', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'0.82rem' }}>
                            {emailTesting ? <Loader size={14} className="spin"/> : <Mail size={14}/>}
                            Test Email
                        </button>
                    </div>
                </div>

                <div className="glass-panel" style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>

                {/* Email test banner */}
                {emailTestResult && (
                    <div style={{ padding:'0.6rem 1.5rem', background: emailTestResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color: emailTestResult.success ? '#10b981' : '#ef4444' }}>
                        {emailTestResult.success ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>}
                        {emailTestResult.message || emailTestResult.error}
                        <button onClick={() => setEmailTestResult(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><X size={14}/></button>
                    </div>
                )}

                {/* Category Tabs */}
                <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.2)' }}>
                    {[
                        ['linux', '🐧 Linux / SSH'], 
                        ['windows', '🪟 Windows'], 
                        ['python', '🐍 Python'], 
                        ['network', '📡 Network Devices'],
                        ['custom', '✍️ Custom Script']
                    ].map(([cat, label]) => (
                        <button key={cat} onClick={() => { setCategoryFilter(cat); setActiveScriptId(BASH_SCRIPTS.find(s => s.category === cat)?.id || ''); setOutput(null); setCustomCmd(''); }}
                            style={{ padding:'0.75rem 1rem', background: categoryFilter === cat ? 'rgba(139,92,246,0.15)' : 'transparent', border:'none', borderBottom: categoryFilter === cat ? '2px solid var(--primary)' : '2px solid transparent', color: categoryFilter === cat ? 'white' : 'var(--text-muted)', cursor:'pointer', fontSize:'0.85rem', fontWeight: categoryFilter === cat ? 600 : 400 }}>
                            {label}
                        </button>
                    ))}
                </div>

                <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
                    {/* Sidebar */}
                    {categoryFilter !== 'custom' && (
                        <div style={{ width:'220px', background:'rgba(0,0,0,0.25)', borderRight:'1px solid rgba(255,255,255,0.05)', overflowY:'auto', flexShrink:0 }}>
                            {filteredScripts.map(script => (
                                <button key={script.id} onClick={() => { setActiveScriptId(script.id); setOutput(null); setCustomCmd(''); }}
                                    style={{ display:'flex', flexDirection:'column', width:'100%', padding:'0.9rem 1rem', background: activeScript?.id === script.id ? 'rgba(139,92,246,0.12)' : 'transparent', border:'none', borderLeft: activeScript?.id === script.id ? '2px solid var(--primary)' : '2px solid transparent', color: activeScript?.id === script.id ? 'white' : 'var(--text-muted)', cursor:'pointer', textAlign:'left', transition:'all 0.2s' }}>
                                    <div style={{ fontSize:'0.88rem', fontWeight:500 }}>{script.icon} {script.title}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main area */}
                    <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#0a0e17', overflow:'hidden' }}>

                        {categoryFilter === 'custom' ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding:'1rem 1.5rem', background:'#0f1624', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                    <div>
                                        <div style={{ color:'white', fontSize:'0.9rem', fontWeight:600 }}>✍️ Custom Script Execution</div>
                                        <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:'4px' }}>Write your own multiline script. It will run on the selected device exactly as written.</div>
                                    </div>
                                    <button onClick={handleRun} disabled={isRunning || !selectedDeviceId}
                                        style={{ display:'flex', alignItems:'center', gap:'5px', background: isRunning ? 'rgba(6,182,212,0.1)' : 'var(--primary)', border:'none', padding:'5px 16px', borderRadius:'6px', color: 'white', cursor: isRunning ? 'not-allowed' : 'pointer', fontSize:'0.85rem', fontWeight:600 }}>
                                        {isRunning ? <><Loader size={14} className="spin"/> Running...</> : <><Play size={14}/> Run on Device</>}
                                    </button>
                                </div>
                                <div style={{ flex: 1, padding: '1rem', display: 'flex' }}>
                                    <textarea
                                        value={customCmd}
                                        onChange={e => setCustomCmd(e.target.value)}
                                        placeholder="# Type your multiline bash/python/powershell/cli script here..."
                                        style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#a3e635', fontFamily: 'monospace', fontSize: '0.9rem', padding: '1rem', resize: 'none', outline: 'none', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Script header */}
                                <div style={{ padding:'1rem 1.5rem', background:'#0f1624', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
                                    <div>
                                        <div style={{ color:'var(--accent-green)', fontFamily:'monospace', fontSize:'0.9rem', fontWeight:600 }}>
                                            {activeScript?.icon} {activeScript?.title || '—'}
                                        </div>
                                        <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:'4px' }}>
                                            {activeScript?.description}
                                        </div>
                                    </div>
                                    <div style={{ display:'flex', gap:'0.5rem' }}>
                                        <button onClick={handleCopy} style={{ display:'flex', alignItems:'center', gap:'5px', background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border:`1px solid ${copied ? '#10b981' : 'rgba(255,255,255,0.1)'}`, padding:'5px 12px', borderRadius:'6px', color: copied ? '#10b981' : 'var(--text-muted)', cursor:'pointer', fontSize:'0.82rem', transition:'all 0.2s' }}>
                                            {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                        <button onClick={handleRun} disabled={isRunning || !selectedDeviceId || categoryFilter === 'windows'}
                                            title={categoryFilter === 'windows' ? 'Windows scripts must be run on the Windows device manually' : 'Run on selected device via SSH'}
                                            style={{ display:'flex', alignItems:'center', gap:'5px', background: categoryFilter !== 'windows' ? (isRunning ? 'rgba(6,182,212,0.1)' : 'var(--primary)') : 'rgba(255,255,255,0.05)', border:'none', padding:'5px 16px', borderRadius:'6px', color: categoryFilter !== 'windows' ? 'white' : 'var(--text-muted)', cursor: isRunning || categoryFilter === 'windows' ? 'not-allowed' : 'pointer', fontSize:'0.85rem', fontWeight:600, opacity: categoryFilter === 'windows' ? 0.5 : 1 }}>
                                            {isRunning ? <><Loader size={14} className="spin"/> Running...</> : <><Play size={14}/> Run on Device</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Script preview */}
                                <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1.5rem' }}>
                                    <pre style={{ margin:0, fontFamily:"'Consolas', 'Monaco', monospace", fontSize:'0.85rem', lineHeight:'1.55', color:'#d4d4d4', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                                        {activeScript?.command || activeScript?.code || ''}
                                    </pre>
                                </div>
                            </>
                        )}

                        {/* Output Panel */}
                        {(isRunning || output) && (
                            <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', background:'#050810' }}>
                                <div style={{ padding:'6px 1rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'5px' }}>
                                        {isRunning ? <><Loader size={11} className="spin"/> Executing...</> : output?.error ? <><AlertTriangle size={11} color="#ef4444"/> Error</> : <><CheckCircle size={11} color="#10b981"/> Exit code: {output?.exitCode}</>}
                                    </span>
                                    {output && <button onClick={() => setOutput(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.75rem' }}>× Clear</button>}
                                </div>
                                <div ref={outputRef} style={{ maxHeight:'220px', overflowY:'auto', padding:'1rem 1.5rem' }}>
                                    <pre style={{ margin:0, fontFamily:"'Consolas', monospace", fontSize:'0.82rem', lineHeight:'1.5', color: output?.error ? '#ef4444' : '#a3e635', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                                        {isRunning ? 'Running...' : outputText}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomationPanel;
