import React from 'react';
import { Agent } from '../../types';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  hasTriggeredAlert: boolean;
}

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, onEdit, hasTriggeredAlert }) => {
    // (0.5 * FCR) + (0.3 * (1 - Escalation Rate)) + (0.2 * Sentiment Score)
    const healthScore = (0.5 * agent.fcr) + (0.3 * (100 - agent.escalationRate)) + (0.2 * (agent.sentimentScore * 100));

    const getHealthColor = (score: number) => {
        if (score > 80) return 'bg-green-500';
        if (score > 60) return 'bg-yellow-500';
        return 'bg-red-500';
    }

    return (
        <div
            onClick={onClick}
            className="group relative bg-gradient-to-br from-brand-bg-light to-brand-bg rounded-xl border border-brand-border p-4 cursor-pointer overflow-hidden transition-all duration-300 hover:border-brand-primary/50 hover:shadow-card-hover"
        >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-primary/10 via-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
             <Button 
                variant="outline" 
                size="sm"
                onClick={onEdit} 
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
                Edit
            </Button>

            {hasTriggeredAlert && (
                <div className="absolute top-3 left-3 z-10" title="Performance alert triggered">
                    <AlertIcon />
                </div>
            )}
            
            <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img src={agent.avatarUrl} alt={agent.name} className="w-16 h-16 rounded-full border-2 border-brand-border" />
                        {agent.onCall && (
                            <div className="absolute -top-1 -right-1" title="Agent is On Call">
                                <span className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-brand-bg-light"></span>
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-brand-text-light">{agent.name}</h3>
                        <p className="text-sm text-brand-text-dark">{agent.useCase}</p>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1 text-xs text-brand-text-dark">
                        <span>Performance Health</span>
                        <span>{healthScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={healthScore} indicatorClassName={getHealthColor(healthScore)} />
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 text-sm">
                    <div>
                        <div className="text-brand-text-dark text-xs">Workflows Done</div>
                        <div className="font-semibold">{agent.workflowsCompleted.toLocaleString()}</div>
                    </div>
                     <div>
                        <div className="text-brand-text-dark text-xs">Value Generated</div>
                        <div className="font-semibold">${agent.valueGenerated.toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                     <span className={`px-2 py-1 text-xs rounded-full ${agent.status === 'Active' ? 'bg-green-500/20 text-green-400' : agent.status === 'Training' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {agent.status}
                    </span>
                    <span className="text-xs text-brand-text-dark">{agent.deploymentType === 'UNITY_Internal' ? 'UNITY Internal' : 'External Hybrid'}</span>
                </div>
            </div>
        </div>
    );
};