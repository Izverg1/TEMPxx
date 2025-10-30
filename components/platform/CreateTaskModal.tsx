import React, { useState } from 'react';
import { Agent, Project, Task } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreate: (taskData: Omit<Task, 'id'>) => void;
  projects: Project[];
  agents: Agent[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreate, projects, agents }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !projectId || !dueDate) {
      setError('Please fill in Title, Project, and Due Date.');
      return;
    }
    setError('');

    const selectedAgent = agents.find(a => a.id === assigneeId);

    onTaskCreate({
      title,
      description,
      projectId,
      assigneeId,
      assigneeName: selectedAgent?.name,
      assigneeAvatar: selectedAgent?.avatarUrl,
      dueDate,
      status: 'To Do',
    });
    handleClose();
  };
  
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setProjectId(projects[0]?.id || '');
    setAssigneeId('');
    setDueDate('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Task">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="taskTitle" className="text-sm font-medium">Title</label>
          <Input id="taskTitle" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Analyze agent performance" />
        </div>
        <div className="space-y-2">
          <label htmlFor="taskDescription" className="text-sm font-medium">Description (Optional)</label>
          <Textarea id="taskDescription" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add more details..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="taskProject" className="text-sm font-medium">Project</label>
            <select id="taskProject" value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-brand-text-light focus:ring-2 focus:ring-brand-primary">
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="taskAssignee" className="text-sm font-medium">Assignee (Optional)</label>
            <select id="taskAssignee" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-brand-text-light focus:ring-2 focus:ring-brand-primary">
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
            <label htmlFor="taskDueDate" className="text-sm font-medium">Due Date</label>
            <Input id="taskDueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="[color-scheme:dark]" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Task</Button>
        </div>
      </div>
    </Modal>
  );
};
