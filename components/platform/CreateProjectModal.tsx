import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreate: (data: { name: string; phoneNumber: string }) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onProjectCreate }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !phoneNumber.trim()) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    onProjectCreate({ name, phoneNumber });
    onClose();
    setName('');
    setPhoneNumber('');
  };

  const handleClose = () => {
    setName('');
    setPhoneNumber('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <div className="space-y-4">
        <p className="text-sm text-brand-text-dark">
          Define a new project to house your agents. Each project has its own performance metrics, workflows, and configurations.
        </p>
        <div className="space-y-2">
            <label htmlFor="projectName" className="text-sm font-medium text-brand-text-light">Project Name</label>
            <Input 
                id="projectName"
                placeholder="e.g., Q4 Retail Support"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
        </div>
        <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-brand-text-light">Assigned Phone Number</label>
            <Input 
                id="phoneNumber"
                placeholder="e.g., +1 (800) 555-0199"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-brand-text-dark">This is the number customers will call to interact with agents in this project.</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Create Project</Button>
        </div>
      </div>
    </Modal>
  );
};