import React from 'react';
import { Button } from '../ui/Button';
import { Task } from '../../types';

interface TaskConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  task: Task | null;
}

export const TaskConfirmationModal: React.FC<TaskConfirmationModalProps> = ({ isOpen, onClose, onConfirm, task }) => {
  if (!isOpen || !task) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-brand-bg rounded-xl border border-brand-border shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-brand-border">
          <h2 className="text-lg font-semibold">Confirm Task Completion</h2>
          <button onClick={onClose} className="text-brand-text-dark hover:text-brand-text-light">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div className="p-6">
            <p className="text-brand-text-dark">Are you sure you want to mark the following task as 'Done'?</p>
            <p className="font-semibold text-brand-text-light mt-2 bg-brand-bg-light p-3 rounded-md">"{task.title}"</p>
        </div>
        <footer className="flex justify-end gap-2 p-4 bg-brand-bg-light/30 rounded-b-xl">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm}>Mark as Done</Button>
        </footer>
      </div>
    </div>
  );
};