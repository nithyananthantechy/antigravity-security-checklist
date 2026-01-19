import React from 'react';
import * as Icons from 'lucide-react';

const CategoryFilter = ({ categories, activeCategory, onSelect, counts }) => {
    return (
        <div style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            marginBottom: '2rem',
            scrollbarWidth: 'none' // Hide scrollbar for cleaner look
        }}>
            <button
                onClick={() => onSelect('all')}
                className="glass-panel"
                style={{
                    padding: '0.75rem 1.5rem',
                    minWidth: 'max-content',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    background: activeCategory === 'all' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-card)',
                    borderColor: activeCategory === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                    color: activeCategory === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
                    transition: 'all 0.3s ease'
                }}
            >
                <Icons.Layers size={18} />
                <span style={{ fontWeight: 500 }}>All Systems</span>
                <span style={{
                    background: activeCategory === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: 'white'
                }}>
                    {counts.total}
                </span>
            </button>

            {categories.map((cat) => {
                const Icon = Icons[cat.icon] || Icons.Circle; // Dynamic icon rendering
                const isActive = activeCategory === cat.id;

                return (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className="glass-panel"
                        style={{
                            padding: '0.75rem 1.5rem',
                            minWidth: 'max-content',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            background: isActive ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-card)',
                            borderColor: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                            color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                            transition: 'all 0.3s ease',
                            transform: isActive ? 'translateY(-2px)' : 'none',
                            boxShadow: isActive ? '0 0 15px var(--primary-glow)' : 'none'
                        }}
                    >
                        <Icon size={18} />
                        <span style={{ fontWeight: 500 }}>{cat.label}</span>
                        <span style={{
                            background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            color: 'white'
                        }}>
                            {counts[cat.id] || 0}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryFilter;
