import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, Send, Save, AlertTriangle, CheckCircle } from 'lucide-react';

const API_BASE = `http://${window.location.hostname}:3001`;

const EmailConfigModal = () => {
    const [recipients, setRecipients] = useState([]);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('');
    const [notification, setNotification] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.recipients && Array.isArray(data.recipients)) {
                    setRecipients(data.recipients);
                }
            })
            .catch(err => console.error("Failed to load settings:", err));
    }, []);

    const showNotif = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleAddRecipient = (e) => {
        e.preventDefault();
        if (!newName || !newEmail || !newRole) {
            showNotif('error', 'Please fill all recipient fields.');
            return;
        }
        if (recipients.find(r => r.email === newEmail)) {
            showNotif('error', 'This email is already in the recipient list.');
            return;
        }

        const newRecipient = { id: Date.now().toString(), name: newName, email: newEmail, role: newRole };
        setRecipients([...recipients, newRecipient]);
        setNewName(''); setNewEmail(''); setNewRole('');
    };

    const handleRemoveRecipient = (id) => {
        setRecipients(recipients.filter(r => r.id !== id));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipients })
            });
            if (!res.ok) throw new Error('Failed to save settings');
            showNotif('success', 'Recipient configuration saved successfully. Auto-scans will use this list.');
        } catch (err) {
            showNotif('error', err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendReportNow = async () => {
        setIsSending(true);
        try {
            await fetch(`${API_BASE}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipients })
            });

            const res = await fetch(`${API_BASE}/api/send-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send report');
            
            showNotif('success', data.message || 'Report dispatched successfully!');
        } catch (err) {
            showNotif('error', err.message);
        } finally {
            setIsSending(false);
        }
    };

    const inputStyle = { width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '0 1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={24} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'white' }}>Email Report Configurations</span>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Configure the recipients who will receive the security audit report. These recipients apply to both the manual "Send Report" button and the background auto-scanner.
                </p>

                {/* Notifications */}
                {notification && (
                    <div style={{ padding: '0.75rem 1rem', background: notification.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: notification.type === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)', color: notification.type === 'success' ? '#10b981' : '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        {notification.msg}
                    </div>
                )}

                {/* Add Recipient Form */}
                <form onSubmit={handleAddRecipient} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Name</label>
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Doe" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email</label>
                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@example.com" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Position / Role</label>
                        <input type="text" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="IT Director" style={inputStyle} />
                    </div>
                    <button type="submit" style={{ padding: '10px 14px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', color: '#06b6d4', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, transition: 'all 0.2s' }}>
                        <Plus size={16} /> Add
                    </button>
                </form>

                {/* Recipient List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                        Configured Recipients ({recipients.length})
                    </div>
                    
                    {recipients.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                            <Mail size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                            <div>No custom recipients configured.</div>
                            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>The system will fallback to the default .env addresses.</div>
                        </div>
                    ) : (
                        recipients.map(r => (
                            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 1rem', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                        {r.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{r.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                                        {r.role}
                                    </div>
                                    <button onClick={() => handleRemoveRecipient(r.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Remove">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '1.25rem 1rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={handleSaveSettings} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', cursor: isSaving ? 'wait' : 'pointer', fontSize: '0.9rem' }}>
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
                
                <button onClick={handleSendReportNow} disabled={isSending} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))', border: 'none', color: 'white', borderRadius: '6px', cursor: isSending ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 0 15px rgba(6,182,212,0.3)' }}>
                    <Send size={16} /> {isSending ? 'Sending emails...' : 'Save & Send Report Now'}
                </button>
            </div>
        </div>
    );
};

export default EmailConfigModal;
