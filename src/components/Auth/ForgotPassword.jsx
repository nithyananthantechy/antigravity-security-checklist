import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DesicrewLogo from '../Shared/DesicrewLogo';
import { Mail, ArrowLeft, CheckCircle, AlertTriangle, Key } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState('email'); // email | code | reset | done
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const MOCK_USERS_KEY = 'antigravity_users';

    // Step 1: Check if email exists and simulate sending a code
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
            const isAdmin = email === 'admin@desicrew.in';
            const userExists = isAdmin || users.find(u => u.email === email);

            if (!userExists) {
                setError('No account found with that email address.');
                setIsLoading(false);
                return;
            }

            // Generate a 6-digit code (simulated — in prod this would be emailed)
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedCode(otp);
            setIsLoading(false);
            setStep('code');
        }, 1000);
    };

    // Step 2: Verify the code
    const handleCodeSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (code !== generatedCode) {
            setError('Incorrect verification code. Please try again.');
            return;
        }
        setStep('reset');
    };

    // Step 3: Set new password
    const handleResetSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // Update in localStorage
        const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
        const idx = users.findIndex(u => u.email === email);
        if (idx !== -1) {
            users[idx].password = newPassword; // will be re-hashed on next login
            localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
        }
        // Note: for admin@desicrew.in the hardcoded password can't be changed here — that's expected for a demo

        setStep('done');
        setTimeout(() => navigate('/login'), 3000);
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 10px 10px 40px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        transition: '0.3s',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', margin: '1rem', position: 'relative', zIndex: 10, border: '1px solid rgba(6,182,212,0.25)', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>

                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <DesicrewLogo size="small" />
                </div>

                {step === 'email' && (
                    <>
                        <h2 className="neon-text" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.6rem' }}>Forgot Password</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            Enter your account email to receive a verification code.
                        </p>
                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}
                        <form onSubmit={handleEmailSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--accent-cyan)' }} />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" style={inputStyle} className="glow-focus" />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--primary))', border: 'none', borderRadius: '8px', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                                {isLoading ? 'Checking...' : 'Send Verification Code'}
                            </button>
                        </form>
                    </>
                )}

                {step === 'code' && (
                    <>
                        <h2 className="neon-text" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.6rem' }}>Check Your Email</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            A 6-digit code was sent to <strong style={{ color: 'var(--accent-cyan)' }}>{email}</strong>
                        </p>
                        {/* Demo mode: show code since we cant actually email */}
                        <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#06b6d4' }}>
                            🔑 <strong>Demo Mode:</strong> Your code is <strong style={{ fontSize: '1rem', letterSpacing: '3px' }}>{generatedCode}</strong>
                        </div>
                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}
                        <form onSubmit={handleCodeSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>6-Digit Code</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--accent-cyan)' }} />
                                    <input type="text" value={code} onChange={e => setCode(e.target.value)} required maxLength={6} placeholder="000000" style={{ ...inputStyle, letterSpacing: '6px', fontSize: '1.2rem', textAlign: 'center' }} />
                                </div>
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))', border: 'none', borderRadius: '8px', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                Verify Code
                            </button>
                        </form>
                    </>
                )}

                {step === 'reset' && (
                    <>
                        <h2 className="neon-text" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.6rem' }}>Set New Password</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            Choose a strong new password for your account.
                        </p>
                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}
                        <form onSubmit={handleResetSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="••••••••" style={{ ...inputStyle, paddingLeft: '10px' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Confirm Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" style={{ ...inputStyle, paddingLeft: '10px' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981, var(--primary))', border: 'none', borderRadius: '8px', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                Reset Password
                            </button>
                        </form>
                    </>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <CheckCircle size={60} color="#10b981" style={{ marginBottom: '1.5rem' }} />
                        <h2 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Password Reset!</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your password has been updated. Redirecting to login...</p>
                    </div>
                )}

                {/* Back to Login */}
                {step !== 'done' && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
