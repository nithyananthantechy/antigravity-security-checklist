import React, { useState, useRef } from 'react';
import { X, User, Camera, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [avatar, setAvatar] = useState(() => localStorage.getItem('secops_avatar') || null);
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [savedProfile, setSavedProfile] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);

    const fileRef = useRef();

    if (!isOpen) return null;

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            setAvatar(dataUrl);
            localStorage.setItem('secops_avatar', dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = () => {
        const stored = JSON.parse(localStorage.getItem('antigravity_current_user') || '{}');
        stored.name = displayName;
        localStorage.setItem('antigravity_current_user', JSON.stringify(stored));
        setSavedProfile(true);
        setTimeout(() => setSavedProfile(false), 2500);
    };

    const handleChangePassword = () => {
        if (!newPassword || !oldPassword) return setPwMsg({ type: 'error', text: 'All fields are required.' });
        if (newPassword.length < 6) return setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
        if (newPassword !== confirmPassword) return setPwMsg({ type: 'error', text: 'Passwords do not match.' });
        // Update in localStorage mock store
        const users = JSON.parse(localStorage.getItem('antigravity_users') || '[]');
        const idx = users.findIndex(u => u.email === user?.email);
        if (idx !== -1) {
            if (users[idx].password !== oldPassword) return setPwMsg({ type: 'error', text: 'Current password is incorrect.' });
            users[idx].password = newPassword;
            localStorage.setItem('antigravity_users', JSON.stringify(users));
        }
        setPwMsg({ type: 'success', text: 'Password updated successfully!' });
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
        setTimeout(() => setPwMsg(null), 3000);
    };

    const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                        <User size={18} color="var(--accent-cyan)"/> My Profile
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {[['profile', 'Profile'], ['password', 'Change Password']].map(([key, label]) => (
                        <button key={key} onClick={() => setActiveTab(key)} style={{ flex: 1, padding: '0.75rem', background: activeTab === key ? 'rgba(139,92,246,0.15)' : 'transparent', border: 'none', borderBottom: activeTab === key ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === key ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: activeTab === key ? 600 : 400 }}>
                            {label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {activeTab === 'profile' ? (
                        <div>
                            {/* Avatar */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                                    <div onClick={() => fileRef.current.click()} style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', cursor: 'pointer', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <User size={40} color="var(--primary)"/>}
                                    </div>
                                    <div onClick={() => fileRef.current.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Camera size={14} color="white"/>
                                    </div>
                                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange}/>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Display Name</label>
                                <input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)}/>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Email</label>
                                <input style={{ ...inputStyle, opacity: 0.6 }} value={user?.email || ''} readOnly/>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Role</label>
                                <input style={{ ...inputStyle, opacity: 0.6 }} value={user?.role || 'Administrator'} readOnly/>
                            </div>

                            <button onClick={handleSaveProfile} style={{ width: '100%', padding: '0.75rem', background: savedProfile ? 'rgba(16,185,129,0.8)' : 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.3s' }}>
                                {savedProfile ? <><Check size={16}/> Saved!</> : 'Save Profile'}
                            </button>
                        </div>
                    ) : (
                        <div>
                            {pwMsg && (
                                <div style={{ padding: '0.75rem', borderRadius: '6px', background: pwMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${pwMsg.type === 'success' ? '#10b981' : '#ef4444'}`, color: pwMsg.type === 'success' ? '#10b981' : '#ef4444', marginBottom: '1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {pwMsg.type === 'success' ? <Check size={14}/> : <AlertCircle size={14}/>} {pwMsg.text}
                                </div>
                            )}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showOld ? 'text' : 'password'} style={inputStyle} value={oldPassword} onChange={e => setOldPassword(e.target.value)}/>
                                    <button type="button" onClick={() => setShowOld(!showOld)} style={{ position: 'absolute', right: '8px', top: '9px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>{showOld ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showNew ? 'text' : 'password'} style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
                                    <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '8px', top: '9px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>{showNew ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Confirm New Password</label>
                                <input type="password" style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                            </div>
                            <button onClick={handleChangePassword} style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                Update Password
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
