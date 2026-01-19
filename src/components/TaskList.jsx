import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onToggle, onUpdateNotes }) => {
    if (tasks.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <p>No tasks found in this sector.</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '400px' }}>
            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onUpdateNotes={onUpdateNotes}
                />
            ))}
        </div>
    );
};

export default TaskList;
