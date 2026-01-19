import React, { useState, useEffect } from 'react';
import Header from '../Header';
import ProgressBar from '../ProgressBar';
import CategoryFilter from '../CategoryFilter';
import TaskList from '../TaskList';
import AutomationPanel from '../AutomationPanel';
import Roadmap from '../Roadmap';
import FirewallDashboard from './FirewallDashboard';
import { firewallService } from '../../services/firewallService';
import { INITIAL_TASKS, CATEGORIES } from '../../data/tasks';
import { Download, Terminal, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SecurityChecklist = () => {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('antigravity_tasks');
        return saved ? JSON.parse(saved) : INITIAL_TASKS;
    });

    const [activeCategory, setActiveCategory] = useState('all');
    const [showAutomation, setShowAutomation] = useState(false);
    const [showFirewall, setShowFirewall] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('antigravity_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const handleToggleTask = (id) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const handleUpdateNotes = (id, notes) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, notes } : t
        ));
    };

    const handleFirewallData = (scanData) => {
        setTasks(prev => prev.map(t => {
            let newTask = { ...t };
            // Ensure ID comparison is loose (==) to handle string/number differences

            // 1. Firewall Logs (Task ID 1)
            if (t.id == 1) {
                newTask.notes = firewallService.generateModuleNote('firewall', scanData.modules.firewall, scanData.timestamp);
                newTask.completed = true;
            }

            // 2. VPN Logs (Task ID 2)
            if (t.id == 2) {
                newTask.notes = firewallService.generateModuleNote('vpn', scanData.modules.vpn, scanData.timestamp);
                newTask.completed = true;
            }

            // 3. Patch Compliance (Task ID 8 - Server Patch)
            if (t.id == 8) {
                newTask.notes = firewallService.generateModuleNote('patching', scanData.modules.patching, scanData.timestamp);
                newTask.completed = true;
            }

            // 4. Backup Verification (Task ID 31)
            if (t.id == 31) {
                newTask.notes = firewallService.generateModuleNote('backup', scanData.modules.backup, scanData.timestamp);
                newTask.completed = true;
            }

            return newTask;
        }));
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Category', 'Priority', 'Task', 'Completed', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...tasks.map(t => [
                t.id,
                t.category,
                t.priority,
                `"${t.title.replace(/"/g, '""')}"`,
                t.completed ? 'Yes' : 'No',
                `"${(t.notes || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `security_checklist_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Filter Logic
    const filteredTasks = activeCategory === 'all'
        ? tasks
        : tasks.filter(t => t.category === activeCategory);

    // Stats Logic
    const counts = tasks.reduce((acc, task) => {
        acc.total = (acc.total || 0) + 1;
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
    }, { total: 0 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;

    return (
        <div className="container-custom">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0.5rem 1rem',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        borderRadius: '4px'
                    }}
                >
                    LOGOUT ({user?.name})
                </button>
            </div>

            <Header />

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setShowAutomation(true)}
                    className="glass-panel"
                    style={{
                        flex: 1,
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--accent-cyan)',
                        transition: 'all 0.2s'
                    }}
                >
                    <Terminal size={20} />
                    OPEN AUTOMATION CONSOLE
                </button>

                <button
                    onClick={() => setShowFirewall(!showFirewall)}
                    className="glass-panel"
                    style={{
                        flex: 1,
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--accent-pink)',
                        transition: 'all 0.2s',
                        borderColor: showFirewall ? 'var(--accent-pink)' : 'transparent'
                    }}
                >
                    <ShieldAlert size={20} />
                    {showFirewall ? 'HIDE THREAT DASHBOARD' : 'FIREWALL DASHBOARD'}
                </button>

                <button
                    onClick={handleExportCSV}
                    className="glass-panel"
                    style={{
                        flex: 1,
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--accent-green)',
                        transition: 'all 0.2s'
                    }}
                >
                    <Download size={20} />
                    EXPORT REPORT (CSV)
                </button>
            </div>

            <ProgressBar total={totalTasks} completed={completedTasks} />

            <CategoryFilter
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
                counts={counts}
            />

            {showFirewall && (
                <div style={{ marginBottom: '3rem', animation: 'slide-in 0.3s ease-out' }}>
                    <FirewallDashboard onDataRetrieved={handleFirewallData} />
                </div>
            )}

            <main className="glass-panel" style={{ padding: '2rem', minHeight: '500px' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                        {activeCategory === 'all' ? 'All Operations' : CATEGORIES.find(c => c.id === activeCategory)?.label}
                    </h2>
                    <span style={{ color: 'var(--text-muted)' }}>
                        {filteredTasks.filter(t => t.completed).length} / {filteredTasks.length} Completed
                    </span>
                </div>

                <TaskList
                    tasks={filteredTasks}
                    onToggle={handleToggleTask}
                    onUpdateNotes={handleUpdateNotes}
                />
            </main>

            <Roadmap />

            <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', paddingBottom: '2rem' }}>
                <p>ANTIGRAVITY // SECURITY OPERATIONS CENTER</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>System Version 2.1.0 // Encrypted Connection</p>
            </footer>

            <AutomationPanel isOpen={showAutomation} onClose={() => setShowAutomation(false)} />
        </div>
    );
};

export default SecurityChecklist;
