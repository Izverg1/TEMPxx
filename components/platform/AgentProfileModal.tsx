import React from 'react';
import { Agent, Workflow } from '../../types';
import { StaticWorkflowVisualization } from './StaticWorkflowVisualization';

interface AgentProfileModalProps {
  agent: Agent;
  workflow: Workflow | undefined,
  isOpen: boolean;
  onClose: () => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ContactCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="8" x2="16" y1="12" y2="12"/><path d="M11 7h-1"/><path d="M14 17h-1"/></svg>

export const AgentProfileModal: React.FC<AgentProfileModalProps> = ({ 
    agent, 
    workflow,
    isOpen, 
    onClose, 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#0D1117] rounded-xl border border-teal-400/30 shadow-[0_0_35px_rgba(45,212,191,0.2),_0_0_15px_rgba(45,212,191,0.3)] w-full max-w-4xl max-h-[90vh] flex flex-col animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-20">
            <button onClick={onClose} className="text-brand-text-dark hover:text-white transition-colors">
                <CloseIcon />
            </button>
        </div>
        
        <div className="overflow-y-auto p-8">
            {/* Header section */}
            <div className="flex items-center gap-6">
                <img src={agent.avatarUrl} alt={agent.name} className="w-24 h-24 rounded-full" />
                <div className="flex-1">
                    <h2 className="text-4xl font-bold text-white">{agent.name}</h2>
                    <p className="text-xl text-teal-300 mt-1">"I'm calling Leads and Booking appointments"</p>
                </div>
                <div className="flex-shrink-0">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Integration</h4>
                    <div className="flex items-center gap-3 text-teal-300">
                        <EmailIcon />
                        <CalendarIcon />
                        <ContactCardIcon />
                    </div>
                </div>
            </div>

            {/* About Me */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-teal-300">About me</h3>
                <p className="text-gray-400 mt-2 text-sm max-w-3xl">
                    {agent.backstory}
                </p>
            </div>

            {/* How I work */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-teal-300">How I work?</h3>
                {workflow ? (
                    <StaticWorkflowVisualization workflow={workflow} />
                ) : (
                    <div className="mt-4 text-center text-gray-500 bg-black/20 p-8 rounded-lg">
                        No workflow assigned to this agent.
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};
