import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import { SCRIPTS } from '../data/automationScripts';

const AutomationPanel = ({ isOpen, onClose }) => {
    const [activeScriptId, setActiveScriptId] = useState(SCRIPTS[0].id);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const activeScript = SCRIPTS.find(s => s.id === activeScriptId);

    const handleCopy = () => {
        navigator.clipboard.writeText(activeScript.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(5, 7, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '900px',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--primary)',
                boxShadow: '0 0 50px rgba(139, 92, 246, 0.2)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Terminal size={20} color="var(--accent-cyan)" />
                        <span style={{ fontWeight: 600, letterSpacing: '1px' }}>AUTOMATION_CONSOLE_V1.0</span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--text-muted)',
                            color: 'var(--text-muted)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        CLOSE
                    </button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Sidebar */}
                    <div style={{
                        width: '250px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        overflowY: 'auto'
                    }}>
                        {SCRIPTS.map(script => (
                            <button
                                key={script.id}
                                onClick={() => setActiveScriptId(script.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    padding: '1rem',
                                    background: activeScriptId === script.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderLeft: activeScriptId === script.id ? '2px solid var(--primary)' : '2px solid transparent',
                                    color: activeScriptId === script.id ? 'var(--text-main)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{script.title}</div>
                            </button>
                        ))}
                    </div>

                    {/* Code Viewer */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0e17' }}>
                        <div style={{ padding: '1rem', background: '#0f1624', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ color: 'var(--accent-green)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    &gt; {activeScript.fullTitle}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                                    {activeScript.description}
                                </div>
                            </div>
                            <button
                                onClick={handleCopy}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: copied ? 'var(--accent-green)' : 'var(--primary)',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'COPIED' : 'COPY SCRIPT'}
                            </button>
                        </div>

                        <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
                            <pre style={{
                                margin: 0,
                                fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                                color: '#d4d4d4',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {activeScript.code}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomationPanel;
