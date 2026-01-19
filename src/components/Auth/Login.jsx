import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import DesicrewLogo from '../Shared/DesicrewLogo';
import { Lock, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
            // Success animation delay
            setTimeout(() => navigate('/'), 500);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Particles (Simplified for performance) */}
            <div className="particles-container"></div>

            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '2.5rem',
                margin: '1rem',
                position: 'relative',
                zIndex: 10,
                border: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 0 40px rgba(0,0,0,0.5)'
            }}>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', animation: 'float 6s ease-in-out infinite' }}>
                    <DesicrewLogo size="large" />
                </div>

                <h2 className="neon-text" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
                    Welcome Back
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Authenticate to access Security Ops
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <Lock size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                            <input
                                type="text" // Change to email in prod
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@desicrew.in"
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 40px',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: '0.3s'
                                }}
                                className="glow-focus"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Password</label>
                            <Link to="/forgot-password" style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', textDecoration: 'none' }}>Forgot Password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '10px 40px 10px 40px',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                className="glow-focus"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '12px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isLoading ? 'wait' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            marginTop: '1rem',
                            transition: 'transform 0.2s',
                            boxShadow: '0 0 15px var(--primary-glow)'
                        }}
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-pink)', fontWeight: 500, textDecoration: 'none' }}>Register Access</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
