import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, AlertCircle, FileText, Server, Wifi, WifiOff, Lock, AlertTriangle } from 'lucide-react';

const PRIORITY_COLORS = {
    High: 'var(--accent-pink)',
    Medium: 'var(--accent-cyan)',
    Low: 'var(--accent-green)'
};

/**
 * Parse auto-fill lines like:
 * "[Auto-filled 14/3/2026, 11:29:14 am | DB Server — Linux Server] Status: Inactive | Could not read UFW status (may need sudo) | Open Ports: 15"
 */
function parseAutoFillLines(notes) {
    if (!notes) return { autoLines: [], manualText: '' };
    const lines = notes.split('\n');
    const autoLines = [];
    const manualLines = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('[Auto-filled')) {
            // Parse: [Auto-filled <date> | <deviceName> — <deviceType>] <rest>
            const headerMatch = trimmed.match(/^\[Auto-filled\s+(.*?)\s*\|\s*(.*?)\]\s*(.*)/);
            if (headerMatch) {
                const [, dateStr, deviceLabel, rest] = headerMatch;
                const parts = rest.split(' | ').map(s => s.trim()).filter(Boolean);
                autoLines.push({ dateStr: dateStr.trim(), deviceLabel: deviceLabel.trim(), parts });
            } else {
                autoLines.push({ dateStr: '', deviceLabel: '', parts: [trimmed] });
            }
        } else if (trimmed) {
            manualLines.push(trimmed);
        }
    });

    return { autoLines, manualText: manualLines.join('\n') };
}

function statusIcon(parts) {
    const statusPart = parts.find(p => p.startsWith('Status:'));
    if (!statusPart) return null;
    const val = statusPart.replace('Status:', '').trim().toLowerCase();
    if (val === 'online' || val === 'active') return <Wifi size={13} color="#10b981" />;
    return <WifiOff size={13} color="#ef4444" />;
}

function FindingCard({ line }) {
    const { dateStr, deviceLabel, parts } = line;

    const statusPart = parts.find(p => p.startsWith('Status:'));
    const isOnline = statusPart && (statusPart.includes('Online') || statusPart.includes('Active'));
    const isError = parts.some(p => /could not|error|failed/i.test(p));
    const portPart = parts.find(p => p.startsWith('Open Ports:'));

    const borderColor = isError ? '#f59e0b' : isOnline ? '#10b981' : '#6366f1';
    const iconEl = isOnline ? <Wifi size={13} color="#10b981" /> : <WifiOff size={13} color="#ef4444" />;

    return (
        <div style={{
            background: 'rgba(0,0,0,0.25)',
            border: `1px solid ${borderColor}33`,
            borderLeft: `3px solid ${borderColor}`,
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '8px',
        }}>
            {/* Device header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <Server size={13} color="#a78bfa" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>{deviceLabel || 'Unknown Device'}</span>
                {statusPart && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: isOnline ? '#10b981' : '#ef4444', background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
                        {iconEl}
                        {statusPart.replace('Status:', '').trim()}
                    </span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '0.67rem', color: 'var(--text-muted)' }}>{dateStr}</span>
            </div>

            {/* Detail chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {parts.filter(p => !p.startsWith('Status:')).map((p, i) => {
                    const isErr = /could not|error|failed/i.test(p);
                    const isPort = p.startsWith('Open Ports:');
                    return (
                        <span key={i} style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: isErr ? 'rgba(245,158,11,0.12)' : isPort ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.05)',
                            color: isErr ? '#f59e0b' : isPort ? '#06b6d4' : '#94a3b8',
                            border: `1px solid ${isErr ? 'rgba(245,158,11,0.25)' : isPort ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.08)'}`,
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            {isErr && <AlertTriangle size={10} />}
                            {isPort && <Lock size={10} />}
                            {p}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

const TaskItem = ({ task, onToggle, onUpdateNotes }) => {
    const [expanded, setExpanded] = useState(false);
    const [notes, setNotes] = useState(task.notes || '');

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        onUpdateNotes(task.id, e.target.value);
    };

    const { autoLines, manualText } = parseAutoFillLines(notes);
    const hasNotes = notes && notes.trim().length > 0;

    return (
        <div
            className={`glass-panel ${task.completed ? 'completed' : ''}`}
            style={{
                marginBottom: '1rem',
                borderLeft: `4px solid ${PRIORITY_COLORS[task.priority]}`,
                transition: 'all 0.3s ease',
                opacity: task.completed ? 0.7 : 1,
                transform: task.completed ? 'scale(0.99)' : 'scale(1)',
            }}
        >
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(task.id)}
                    style={{
                        minWidth: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: `2px solid ${task.completed ? 'var(--accent-green)' : 'var(--text-muted)'}`,
                        background: task.completed ? 'var(--accent-green)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginTop: '2px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {task.completed && <Check size={16} color="white" />}
                </button>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 500,
                            margin: 0,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'var(--text-muted)' : 'var(--text-main)'
                        }}>
                            {task.title}
                        </h3>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: `rgba(255,255,255,0.05)`,
                                border: `1px solid ${PRIORITY_COLORS[task.priority]}`,
                                color: PRIORITY_COLORS[task.priority],
                                fontWeight: 600
                            }}>
                                {task.priority}
                            </span>

                            <button
                                onClick={() => setExpanded(!expanded)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            {task.category.toUpperCase()}
                        </span>
                        {hasNotes && !expanded && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
                                <FileText size={12} />
                                {autoLines.length > 0 ? `${autoLines.length} device finding${autoLines.length > 1 ? 's' : ''}` : 'Has Notes'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div style={{
                    padding: '0 1rem 1rem 3.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    marginTop: '0.5rem',
                    paddingTop: '1rem',
                    animation: 'slide-in 0.2s ease-out'
                }}>
                    {/* Auto-filled device findings */}
                    {autoLines.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Server size={12} />
                                DEVICE SCAN FINDINGS ({autoLines.length} device{autoLines.length > 1 ? 's' : ''})
                            </div>
                            {autoLines.map((line, i) => (
                                <FindingCard key={i} line={line} />
                            ))}
                        </div>
                    )}

                    {/* Manual notes textarea */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            {autoLines.length > 0 ? 'Additional Manual Notes' : 'Findings / Notes'}
                        </label>
                        <textarea
                            value={autoLines.length > 0 ? manualText : notes}
                            onChange={e => {
                                if (autoLines.length > 0) {
                                    // Reconstruct: keep auto lines + new manual text
                                    const autoBlock = autoLines.map(l =>
                                        `[Auto-filled ${l.dateStr} | ${l.deviceLabel}] ${l.parts.join(' | ')}`
                                    ).join('\n');
                                    const combined = autoBlock + (e.target.value ? '\n' + e.target.value : '');
                                    setNotes(combined);
                                    onUpdateNotes(task.id, combined);
                                } else {
                                    setNotes(e.target.value);
                                    onUpdateNotes(task.id, e.target.value);
                                }
                            }}
                            placeholder="Enter additional audit findings here..."
                            style={{
                                width: '100%',
                                minHeight: '60px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                color: 'var(--text-main)',
                                fontFamily: 'inherit',
                                fontSize: '0.85rem',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--primary)' }}>Suggested Automation:</strong> Use PowerShell or SIEM queries to validate.
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskItem;
