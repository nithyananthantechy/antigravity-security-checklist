import React, { useState } from 'react';
import { Shield, Server, Play, Activity, RefreshCw, Save, Lock, Settings } from 'lucide-react';
import { firewallService } from '../../services/firewallService';
import ThreatAnalytics from './ThreatAnalytics';

const FirewallDashboard = ({ onDataRetrieved }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [firewallType, setFirewallType] = useState('fortinet');
    const [scanData, setScanData] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    // Credential State
    const [credentials, setCredentials] = useState({
        name: 'Main-Fortigate-01',
        ip: '',
        username: '',
        password: ''
    });
    const [showCredentials, setShowCredentials] = useState(true);

    const handleConnect = () => {
        // Validate inputs
        if (!credentials.ip || !credentials.username) {
            alert("Please enter Device IP and Username.");
            return;
        }
        // Simulate connection handshake
        setTimeout(() => {
            setIsConnected(true);
            setShowCredentials(false); // Collapse form on success
        }, 1500);
    };

    const handleRunScan = async () => {
        setIsScanning(true);
        setErrorMsg(null);
        try {
            const data = await firewallService.runScan(firewallType, credentials);
            setScanData(data);
            if (onDataRetrieved) {
                onDataRetrieved(data);
            }
        } catch (error) {
            console.error("Scan failed", error);
            setErrorMsg(error.message || "Failed to connect to device");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="float-animation" style={{
                        background: 'var(--accent-cyan)',
                        padding: '10px',
                        borderRadius: '12px',
                        boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
                    }}>
                        <Shield size={24} color="#000" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Device Manager & Automation</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginTop: '4px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isConnected ? '#10b981' : '#ef4444',
                                boxShadow: isConnected ? '0 0 8px #10b981' : 'none'
                            }} />
                            <span style={{ color: isConnected ? '#10b981' : '#ef4444' }}>
                                {isConnected ? `Connected: ${credentials.name}` : 'Disconnected'}
                            </span>
                            {isConnected && (
                                <span style={{
                                    marginLeft: '8px',
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    color: '#f59e0b',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    border: '1px solid rgba(245, 158, 11, 0.4)'
                                }}>
                                    SIMULATION MODE
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {isConnected && (
                        <button
                            onClick={() => setShowCredentials(!showCredentials)}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <Settings size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Credential Form */}
            {(!isConnected || showCredentials) && (
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Device Type</label>
                            <select
                                value={firewallType}
                                onChange={(e) => setFirewallType(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }}
                            >
                                <option value="fortinet">Fortinet FortiGate</option>
                                <option value="cisco">Cisco ASA</option>
                                <option value="paloalto">Palo Alto Networks</option>
                                <option value="ubuntusrv">Ubuntu Server (IPTables)</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Friendly Name</label>
                            <input
                                type="text"
                                value={credentials.name}
                                onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>IP Address / Hostname</label>
                            <input
                                type="text"
                                placeholder="192.168.x.x"
                                value={credentials.ip}
                                onChange={(e) => setCredentials({ ...credentials, ip: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Username</label>
                            <input
                                type="text"
                                placeholder="admin"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Password / Key</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    placeholder="••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white' }}
                                />
                                <Lock size={14} style={{ position: 'absolute', right: 8, top: 10, color: 'var(--text-muted)' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <button
                            onClick={handleConnect}
                            className="glow-border"
                            style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 2rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            {isConnected ? 'Update Connection' : 'Authenticate & Connect'}
                        </button>
                    </div>
                </div>
            )}


            {/* Control Panel (Only visible when connected) */}
            {isConnected && (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={handleRunScan}
                        disabled={isScanning}
                        className="glow-border"
                        style={{
                            background: 'var(--accent-cyan)',
                            color: '#000',
                            border: 'none',
                            padding: '1rem 3rem',
                            borderRadius: '8px',
                            cursor: isScanning ? 'wait' : 'pointer',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            opacity: isScanning ? 0.7 : 1,
                            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
                        }}
                    >
                        {isScanning ? <RefreshCw className="spin" size={20} /> : <Play size={20} />}
                        {isScanning ? 'RUNNING FULL SYSTEM DIAGNOSTICS...' : 'RUN FULL AUTOMATION SCAN'}
                    </button>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {isScanning ? 'Querying Firewall APIs, VMWare vCenter, and WSUS Server...' : 'Ready to scan Network, Patching, and Backup systems.'}
                    </p>
                    {errorMsg && (
                        <div style={{ marginTop: '1rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ef4444', display: 'inline-block' }}>
                            ⚠ Error: {errorMsg}
                        </div>
                    )}
                </div>
            )}

            {scanData && (
                <div style={{ animation: 'slide-in 0.5s ease' }}>
                    <ThreatAnalytics data={scanData} />

                    <div style={{ marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Save size={20} color="#10b981" />
                        <div>
                            <strong style={{ color: '#10b981', display: 'block', marginBottom: '4px' }}>Scan Successful</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Data retrieved from <strong>{scanData.device.name}</strong>. Checklist categories (Firewall, VPN, Patching, Backups) have been automatically updated.
                            </span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FirewallDashboard;
