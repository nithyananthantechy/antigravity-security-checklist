import React from 'react';
import { Rocket, Shield, Lock } from 'lucide-react';
import { PHASES } from '../data/roadmap';

const Roadmap = () => {
    return (
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '3rem' }}>
            <h2 className="neon-text" style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Implementation Roadmap</h2>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {PHASES.map((phase, index) => {
                    const isActive = phase.status === 'active';

                    return (
                        <div key={phase.id} style={{
                            flex: 1,
                            minWidth: '250px',
                            position: 'relative',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            background: isActive
                                ? 'linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1))'
                                : 'rgba(255,255,255,0.02)',
                            border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                            boxShadow: isActive ? '0 0 20px rgba(139, 92, 246, 0.1)' : 'none'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: -10,
                                right: 20,
                                background: isActive ? 'var(--primary)' : '#1e293b',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                color: 'white',
                                fontWeight: 600
                            }}>
                                {phase.duration}
                            </div>

                            <h3 style={{ fontSize: '1.2rem', color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)', marginBottom: '1rem' }}>
                                {phase.title}
                            </h3>

                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {phase.items.map((item, idx) => (
                                    <li key={idx} style={{
                                        marginBottom: '0.5rem',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px'
                                    }}>
                                        <span style={{ color: isActive ? 'var(--accent-green)' : '#475569' }}>•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Roadmap;
