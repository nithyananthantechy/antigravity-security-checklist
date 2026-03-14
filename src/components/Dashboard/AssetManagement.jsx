import React, { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, Activity, Network, ArrowUp, ArrowDown } from 'lucide-react';

const API_BASE = `http://${window.location.hostname}:3001`;

// Simulate live data fluctuations
const useSimulatedLiveStats = () => {
    const [stats, setStats] = useState({ cpu: 0, ram: 0, disk: 0, netIn: 0, netOut: 0 });

    useEffect(() => {
        // Base values
        let cpu = 15 + Math.random() * 20;
        let ram = 45 + Math.random() * 10;
        let disk = 60 + Math.random() * 5;
        let inBps = 100 + Math.random() * 500;
        let outBps = 50 + Math.random() * 200;

        const timer = setInterval(() => {
            setStats({
                cpu: Math.max(2, Math.min(99, cpu + (Math.random() * 10 - 5))),
                ram: Math.max(20, Math.min(95, ram + (Math.random() * 2 - 1))),
                disk: Math.max(10, Math.min(99, disk + (Math.random() * 0.1 - 0.05))),
                netIn: Math.max(0, inBps + (Math.random() * 300 - 150)),
                netOut: Math.max(0, outBps + (Math.random() * 150 - 75))
            });
        }, 2000);

        return () => clearInterval(timer);
    }, []);

    return stats;
};

const DeviceNodeCard = ({ device }) => {
    const stats = useSimulatedLiveStats();
    
    const cpuColor = stats.cpu > 80 ? '#ef4444' : stats.cpu > 50 ? '#f59e0b' : '#10b981';
    const ramColor = stats.ram > 85 ? '#ef4444' : stats.ram > 60 ? '#f59e0b' : '#6366f1';

    return (
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', background: 'rgba(139,92,246,0.1)', borderRadius: '8px', color: '#a78bfa' }}>
                        <Server size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'white', fontWeight: 600 }}>{device.name}</h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}/>
                            {device.ip} • {device.type.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {/* CPU */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Cpu size={12}/> CPU</span>
                        <span style={{ color: cpuColor, fontWeight: 700 }}>{stats.cpu.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${stats.cpu}%`, background: cpuColor, transition: 'width 2s ease, background 0.5s' }} />
                    </div>
                </div>

                {/* RAM */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12}/> Memory</span>
                        <span style={{ color: ramColor, fontWeight: 700 }}>{stats.ram.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${stats.ram}%`, background: ramColor, transition: 'width 2s ease, background 0.5s' }} />
                    </div>
                </div>

                {/* DISK */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HardDrive size={12}/> Disk</span>
                        <span style={{ color: '#06b6d4', fontWeight: 700 }}>{stats.disk.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${stats.disk}%`, background: '#06b6d4', transition: 'width 2s ease' }} />
                    </div>
                </div>

                {/* NETWORK */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Network size={12}/> Network</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#10b981' }}><ArrowDown size={10}/> {(stats.netIn / 1024).toFixed(2)} MB/s</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#8b5cf6' }}><ArrowUp size={10}/> {(stats.netOut / 1024).toFixed(2)} MB/s</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AssetManagement = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/devices`)
            .then(res => res.json())
            .then(data => {
                setDevices(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch devices", err);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '0 1rem' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', color: 'white', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity color="#a78bfa" /> Asset Telemetry
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Hardware utilization metrics per registered node. Values are simulated in the absence of a live agent.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b', animation: 'pulse 2s infinite' }} />
                    SIMULATED TELEMETRY
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading network assets...</div>
            ) : devices.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p>No devices found in the registry.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {devices.map(dev => (
                        <DeviceNodeCard key={dev.id} device={dev} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssetManagement;
