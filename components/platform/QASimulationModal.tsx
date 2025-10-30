import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

interface QASimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

type SimulationStatus = 'idle' | 'running' | 'complete';

export const QASimulationModal: React.FC<QASimulationModalProps> = ({ isOpen, onClose, project }) => {
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (status === 'running') {
      setProgress(0);
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setStatus('complete');
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [status]);
  
  const handleRunSimulation = () => {
    setStatus('running');
  };

  const handleClose = () => {
    setStatus('idle');
    setProgress(0);
    onClose();
  }

  const ResultCard: React.FC<{label: string, value: string, description: string}> = ({label, value, description}) => (
    <div className="bg-brand-bg p-4 rounded-lg">
        <p className="text-sm text-brand-text-dark">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-brand-text-dark">{description}</p>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agent QA Simulation">
      <div className="space-y-4">
        <p className="text-sm text-brand-text-dark">
          Execute existing workflows against historical, scrubbed customer transcripts (the Ground Truth dataset) to measure performance against expected outcomes before deployment.
        </p>
        
        {status === 'idle' && (
             <div className="space-y-4 pt-4">
                <div>
                    <label className="text-sm font-medium">Select Ground Truth Dataset</label>
                    <select className="w-full mt-1 h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-brand-text-light focus:ring-2 focus:ring-brand-primary">
                        <option>Historical Transcripts (Last 30 Days)</option>
                        <option>High-Escalation Scenarios (Q3)</option>
                    </select>
                </div>
                <div className="text-right">
                    <Button onClick={handleRunSimulation}>Run Simulation</Button>
                </div>
            </div>
        )}

        {status === 'running' && (
            <div className="pt-8 text-center">
                <p className="font-semibold">Running Simulation...</p>
                <p className="text-sm text-brand-text-dark mb-4">Processing against 1,283 historical interactions...</p>
                <Progress value={progress} />
            </div>
        )}
        
        {status === 'complete' && (
            <div className="pt-4 space-y-4">
                <h3 className="text-lg font-semibold">Simulation Complete</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ResultCard label="Expected FCR" value="82.0%" description={`Based on ${project.name}'s current workflow.`} />
                    <ResultCard label="Simulated FCR" value="80.5%" description="Performance on historical dataset." />
                    <ResultCard label="Confidence Score" value="High" description="Results are statistically significant." />
                </div>
                <div className="text-right">
                     <Button variant="outline" onClick={() => setStatus('idle')}>Run Again</Button>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};