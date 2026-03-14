import React from 'react';

const ProgressBar = ({ total, completed, onClear }) => {
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Overall Progress</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="neon-text" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{percentage}%</span>
                    {onClear && (
                        <button
                            onClick={onClear}
                            title="Clear all checklist progress and notes"
                            style={{
                                padding: '4px 10px',
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#ef4444',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            Clear Checklist
                        </button>
                    )}
                </div>
            </div>

            <div style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Animated Background Bar */}
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary), var(--accent-cyan), var(--accent-pink))',
                    backgroundSize: '200% 100%',
                    borderRadius: '6px',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: 'drift 3s linear infinite', // repurposing drift or creating a shimmy
                }} />

                {/* Glow behind the bar */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${percentage}%`,
                    height: '100%',
                    background: 'inherit',
                    filter: 'blur(10px)',
                    opacity: 0.5,
                    zIndex: -1,
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Pending: {total - completed}</span>
                <span style={{ color: 'var(--accent-green)' }}>Completed: {completed}</span>
            </div>
        </div>
    );
};

export default ProgressBar;
