import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const ThreatAnalytics = ({ data }) => {
    if (!data) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>

            {/* Blocked Threats Bar Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem' }}>Threat Distribution</h3>
                <div style={{ height: '250px', width: '100%' }}>
                    <ResponsiveContainer>
                        <BarChart data={data.threats}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                            <YAxis stroke="#94a3b8" fontSize={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {data.threats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Hourly Trend Pie Chart (Using Sources data for variation example) */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem' }}>Attack Sources</h3>
                <div style={{ height: '250px', width: '100%' }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data.sources}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.sources.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem' }}>Critical Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#f59e0b' }}>Failed Auth</div>
                        <div className="neon-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.summary.failedAuth}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>Total Blocked</div>
                        <div className="neon-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.summary.totalBlocked}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#06b6d4' }}>Unique IPs</div>
                        <div className="neon-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.summary.uniqueSourceIPs}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>Top Port</div>
                        <div className="neon-text" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{data.summary.topPort}</div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ThreatAnalytics;
