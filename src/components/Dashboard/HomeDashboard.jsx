import React from 'react';
import { ShieldCheck, Server, AlertTriangle, Activity, Terminal, Database, ShieldAlert, Cpu } from 'lucide-react';

const HomeDashboard = ({ onNavigate }) => {
    return (
        <div style={{ padding: '0 1rem' }}>
            {/* Welcome Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Welcome to SECOPS Platform
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        Your central intelligence hub for security and infrastructure management.
                    </p>
                </div>
            </div>

            {/* Quick Actions / Navigation Cards */}
            <h2 style={{ fontSize: '1rem', color: '#a78bfa', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Platform Modules</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { id: 'checklist', title: 'Security Checklist', desc: 'Audit systems against compliance standards.', icon: <ShieldCheck size={28} />, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                    { id: 'assets', title: 'Asset Management', desc: 'Live hardware telemetrics and utilization.', icon: <Activity size={28} />, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
                    { id: 'devices', title: 'Device Registry', desc: 'Manage servers, firewalls, and network devices.', icon: <Server size={28} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' }
                ].map(module => (
                    <div key={module.id} onClick={() => onNavigate(module.id)} className="glass-panel hover-glow" style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'all 0.2s ease', border: `1px solid ${module.color}33`, background: module.bg }}>
                        <div style={{ color: module.color, background: `${module.color}22`, padding: '12px', borderRadius: '12px' }}>
                            {module.icon}
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'white', fontWeight: 600 }}>{module.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{module.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Knowledge Base & Features */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Features */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1rem 0' }}>
                        <Terminal size={18} color="#f59e0b" /> Key Capabilities
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}/>
                            <strong>Automated Audits:</strong> Run continuous headless compliance scans across all hosts.
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4' }}/>
                            <strong>Live Telemetry:</strong> Stream CPU, Memory, and Network I/O from your network assets.
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6' }}/>
                            <strong>Mail Analytics:</strong> Auto-generate executive CSV and HTML metric reports via cron schedules.
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }}/>
                            <strong>SIEM Ready:</strong> Centralized dashboard combining multiple vendor API sources instantly.
                        </li>
                    </ul>
                </div>

                {/* SecOps Knowledge Base */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1rem 0' }}>
                        <Database size={18} color="#ec4899" /> SecOps Knowledge Base
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #ec4899' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#e2e8f0' }}>Incident Response Protocol</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Follow ISO 27001 guidelines for containment and eradication upon anomaly detection.</p>
                        </div>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid #eab308' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#e2e8f0' }}>Zero Trust Architecture</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Always verify connections using mutually authenticated SSL/TLS regardless of intranet origin.</p>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default HomeDashboard;
