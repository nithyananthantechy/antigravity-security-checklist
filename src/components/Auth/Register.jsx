import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import DesicrewLogo from '../Shared/DesicrewLogo';
import { Lock, Mail, User, Briefcase, CheckCircle, AlertTriangle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Analyst'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        if (formData.password.length < 6) return "Password must be at least 6 characters";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const valError = validate();
        if (valError) {
            setError(valError);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await register(formData);
            setTimeout(() => navigate('/'), 500);
        } catch (err) {
            setError(err.message || 'Registration failed');
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
            padding: '2rem 0'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '2rem',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                boxShadow: '0 0 40px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <DesicrewLogo size="medium" />
                    <h2 className="neon-text" style={{ marginTop: '1rem' }}>Request Access</h2>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center'
                    }}>
                        <AlertTriangle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '10px 10px 10px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '10px 10px 10px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Role</label>
                        <div style={{ position: 'relative' }}>
                            <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px 10px 10px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            >
                                <option value="Analyst">Security Analyst</option>
                                <option value="Admin">Administrator</option>
                                <option value="Auditor">Auditor</option>
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Confirm</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(135deg, var(--accent-pink), var(--primary))',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isLoading ? 'wait' : 'pointer',
                            boxShadow: '0 0 15px var(--accent-pink)'
                        }}
                    >
                        {isLoading ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Return to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
