import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, AlertCircle, FileText } from 'lucide-react';

const PRIORITY_COLORS = {
    High: 'var(--accent-pink)',
    Medium: 'var(--accent-cyan)',
    Low: 'var(--accent-green)'
};

const TaskItem = ({ task, onToggle, onUpdateNotes }) => {
    const [expanded, setExpanded] = useState(false);
    const [notes, setNotes] = useState(task.notes || '');

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        onUpdateNotes(task.id, e.target.value);
    };

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
                        {task.notes && !expanded && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
                                <FileText size={12} />
                                Has Notes
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
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Findings / Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={handleNotesChange}
                            placeholder="Enter audit findings here..."
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                color: 'var(--text-main)',
                                fontFamily: 'inherit',
                                fontSize: '0.9rem',
                                resize: 'vertical'
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
