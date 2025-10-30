import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../../types';

interface TaskCardProps {
    task: Task;
    projectName: string;
    onUpdateTask: (taskId: string, newStatus: Task['status']) => void;
    onDragStart: (taskId: string) => void;
}

const KebabIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;


export const TaskCard: React.FC<TaskCardProps> = ({ task, projectName, onUpdateTask, onDragStart }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const statuses: Task['status'][] = ['To Do', 'In Progress', 'Done'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleStatusChange = (newStatus: Task['status']) => {
        onUpdateTask(task.id, newStatus);
        setIsMenuOpen(false);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    const dueDate = new Date(task.dueDate);
    const isOverdue = dueDate < today && task.status !== 'Done';

    return (
        <div 
            draggable="true"
            onDragStart={() => onDragStart(task.id)}
            className={`bg-brand-bg-light border border-brand-border rounded-lg p-3 space-y-2 cursor-grab active:cursor-grabbing relative transition-all ${isOverdue ? 'border-l-4 border-l-red-500 pl-2' : 'hover:border-brand-primary/50'}`}
        >
            <div className="flex justify-between items-start">
                <p className="font-semibold text-sm text-brand-text-light pr-2">{task.title}</p>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-brand-text-dark hover:text-white flex-shrink-0">
                        <KebabIcon />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-1 w-36 bg-brand-bg border border-brand-border rounded-md shadow-lg z-10">
                            <p className="text-xs text-brand-text-dark px-3 py-1.5 border-b border-brand-border">Move to...</p>
                            {statuses.map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-brand-bg-light ${task.status === status ? 'text-brand-primary font-semibold' : ''}`}
                                    disabled={task.status === status}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <p className="text-xs text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full inline-block">{projectName}</p>
            <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                    {task.assigneeAvatar ? (
                        <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-6 h-6 rounded-full" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-xs text-brand-text-dark">?</div>
                    )}
                    <span className="text-xs text-brand-text-dark">{task.assigneeName || 'Unassigned'}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-400 font-semibold' : 'text-brand-text-dark'}`} title={isOverdue ? 'This task is overdue' : ''}>
                    {isOverdue && <ClockIcon />}
                    <span>{task.dueDate}</span>
                </div>
            </div>
        </div>
    );
};