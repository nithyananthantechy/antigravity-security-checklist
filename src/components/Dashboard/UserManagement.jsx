import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail, Shield, CheckCircle, AlertTriangle, Edit2, X, Check } from 'lucide-react';

const MOCK_USERS_KEY = 'antigravity_users';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // { ...user } being edited
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Analyst', organization: 'Desicrew' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const storedUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        setUsers(storedUsers);
    };

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newUser.name || !newUser.email || !newUser.password) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            const currentUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
            if (currentUsers.find(u => u.email === newUser.email)) {
                throw new Error('A user with that email already exists.');
            }

            const userToAdd = { ...newUser, id: Date.now().toString() };
            currentUsers.push(userToAdd);
            localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(currentUsers));

            showSuccess(`User ${userToAdd.name} added successfully.`);
            setNewUser({ name: '', email: '', password: '', role: 'Analyst', organization: 'Desicrew' });
            setIsAdding(false);
            loadUsers();
        } catch (err) {
            setError(err.message || 'Failed to add user.');
        }
    };

    const handleEditSave = () => {
        if (!editingUser.name || !editingUser.email) {
            setError('Name and email are required.');
            return;
        }
        const currentUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        const idx = currentUsers.findIndex(u => u.id === editingUser.id);
        if (idx !== -1) {
            // Update only non-password fields (password unchanged unless explicitly changed)
            currentUsers[idx] = { ...currentUsers[idx], name: editingUser.name, email: editingUser.email, role: editingUser.role };
            localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(currentUsers));
        }
        setEditingUser(null);
        setError('');
        loadUsers();
        showSuccess(`User ${editingUser.name} updated successfully.`);
    };

    const handleDeleteUser = (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const currentUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
            const updatedUsers = currentUsers.filter(u => u.id !== id);
            localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedUsers));
            loadUsers();
        } catch (err) {
            console.error('Failed to delete user', err);
        }
    };

    const inputStyle = { width: '100%', padding: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '0 0 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={24} color="var(--accent-pink)" />
                    <div>
                        <span style={{ fontWeight: 700, letterSpacing: '1px', fontSize: '1.2rem', color: 'white', display: 'block' }}>USER MANAGEMENT</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enterprise Admin Access Control</span>
                    </div>
                </div>
                <button onClick={() => { setIsAdding(true); setEditingUser(null); setError(''); setSuccess(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <UserPlus size={16} /> Add New User
                </button>
            </div>

            {/* Notifications */}
            {success && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <CheckCircle size={16} /> {success}
                </div>
            )}
            {error && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            {/* Content Area */}
            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>

                {/* User List */}
                <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', fontWeight: 600, color: 'white' }}>
                        Registered Enterprise Users
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
                        {users.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <div>No additional users registered yet.</div>
                                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Default admin account represents the system owner.</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {users.map(u => (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: editingUser?.id === u.id ? 'rgba(139,92,246,0.08)' : 'rgba(0,0,0,0.25)', border: `1px solid ${editingUser?.id === u.id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 600 }}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ color: 'white', fontWeight: 600 }}>{u.name}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                    <Mail size={12} /> {u.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(6,182,212,0.1)', color: '#06b6d4', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                <Shield size={12} /> {u.role || 'User'}
                                            </div>
                                            {/* Edit Button */}
                                            <button onClick={() => { setEditingUser({ ...u }); setIsAdding(false); setError(''); }}
                                                style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                                                title="Edit User"
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'none'}>
                                                <Edit2 size={15} />
                                            </button>
                                            {/* Delete Button */}
                                            <button onClick={() => handleDeleteUser(u.id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                                                title="Delete User"
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'none'}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Add User Form Sidebar */}
                {isAdding && (
                    <div className="glass-panel" style={{ width: '380px', display: 'flex', flexDirection: 'column', flexShrink: 0, animation: 'slide-left 0.3s ease-out' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', fontWeight: 600, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Add New User
                            <button onClick={() => { setIsAdding(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={inputStyle} placeholder="Jane Doe" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} style={inputStyle} placeholder="jane@desicrew.in" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Temporary Password <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} style={inputStyle} placeholder="••••••••" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Role</label>
                                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="Administrator">Administrator</option>
                                        <option value="SecOps Engineer">SecOps Engineer</option>
                                        <option value="Analyst">Analyst</option>
                                        <option value="Auditor">Auditor</option>
                                    </select>
                                </div>
                                <button type="submit" style={{ marginTop: '0.5rem', padding: '12px', background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                                    Create User Account
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit User Form Sidebar */}
                {editingUser && (
                    <div className="glass-panel" style={{ width: '380px', display: 'flex', flexDirection: 'column', flexShrink: 0, animation: 'slide-left 0.3s ease-out' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(139,92,246,0.08)', fontWeight: 600, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Edit2 size={15} color="var(--primary)" /> Edit User</span>
                            <button onClick={() => { setEditingUser(null); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="text" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Role</label>
                                    <select value={editingUser.role || 'Analyst'} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        <option value="Administrator">Administrator</option>
                                        <option value="SecOps Engineer">SecOps Engineer</option>
                                        <option value="Analyst">Analyst</option>
                                        <option value="Auditor">Auditor</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={handleEditSave} style={{ flex: 1, padding: '10px', background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <Check size={16} /> Save Changes
                                    </button>
                                    <button onClick={() => { setEditingUser(null); setError(''); }} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes slide-left {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default UserManagement;
