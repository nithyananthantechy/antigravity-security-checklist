import React from 'react';
import { ShieldCheck } from 'lucide-react';
import DesicrewLogo from './Shared/DesicrewLogo';

const Header = () => {
    const getWeekRange = () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay() + 1); // Monday
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Sunday

        const options = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    return (
        <header className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="float-animation" style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        boxShadow: '0 0 20px var(--primary-glow)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <DesicrewLogo size="medium" />
                    </div>
                    <div>
                        <h1 className="neon-text" style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                            SECOPS
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '4px' }}>
                            Security Operations Checklist
                        </p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-glow)' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Current Cycle: {getWeekRange()}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;
