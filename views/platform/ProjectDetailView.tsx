import React, { useState } from 'react';
import { Agent, Alert, Project } from '../../types';
import { Button } from '../../components/ui/Button';
import { AgentCard } from '../../components/platform/AgentCard';
import { AgentProfileModal } from '../../components/platform/AgentProfileModal';
import { QASimulationModal } from '../../components/platform/QASimulationModal';

interface ProjectDetailViewProps {
  project: Project | undefined;
  agents: Agent[];
  alerts: Alert[];
  onLaunchNewAgent: () => void;
  onAccessWorkflowBuilder: () => void;
  onEditAgent: (agent: Agent) => void;
  onStartLiveConversation: (agent: Agent) => void;
  onAddAlert: (alertData: Omit<Alert, 'id'>) => void;
  onDeleteAlert: (alertId: string) => void;
  onToggleAgentOnCall: (agentId: string) => void;
}

const isAlertTriggered = (agent: Agent, alert: Alert): boolean => {
    switch (alert.metric) {
      case 'fcr':
        return alert.condition === 'less than' ? agent.fcr < alert.threshold : agent.fcr > alert.threshold;
      case 'escalationRate':
        return alert.condition === 'less than' ? agent.escalationRate < alert.threshold : agent.escalationRate > alert.threshold;
      case 'sentimentScore':
        return alert.condition === 'less than' ? agent.sentimentScore < alert.threshold : agent.sentimentScore > alert.threshold;
      default:
        return false;
    }
};

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, agents, alerts, onLaunchNewAgent, onAccessWorkflowBuilder, onEditAgent, onStartLiveConversation, onAddAlert, onDeleteAlert, onToggleAgentOnCall }) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isQAModalOpen, setIsQAModalOpen] = useState(false);

  if (!project) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">No Project Selected</h2>
        <p className="text-brand-text-dark mt-2">Please select a project from the Nerve Center dashboard or the header dropdown.</p>
      </div>
    );
  }

  const StatItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-brand-text-light' }) => (
    <div>
      <div className="text-sm text-brand-text-dark">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );

  const agentsWithAlerts = agents.map(agent => {
    const agentAlerts = alerts.filter(a => a.agentId === agent.id);
    const hasTriggeredAlert = agentAlerts.some(alert => isAlertTriggered(agent, alert));
    return { ...agent, hasTriggeredAlert, alerts: agentAlerts };
  });

  const handleAgentClick = (agent: Agent) => {
    const agentData = agentsWithAlerts.find(a => a.id === agent.id);
    setSelectedAgent(agentData || agent);
  };
  
  const selectedAgentWithAlerts = agentsWithAlerts.find(a => a.id === selectedAgent?.id);

  return (
    <div className="space-y-6">
      <div className="bg-brand-bg rounded-lg border border-brand-border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold">{project.name}</h2>
            <div className="flex items-center gap-6">
                <StatItem label="Status" value={project.status} color={project.status === 'Active' ? 'text-green-400' : project.status === 'Error' ? 'text-red-400' : 'text-yellow-400'} />
                <StatItem label="Budget Usage" value={`${project.budgetUsage}%`} />
                <StatItem label="Project FCR" value={`${project.fcr}%`} />
                <StatItem label="Escalation Rate" value={`${project.escalationRate}%`} />
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsQAModalOpen(true)}>Initiate QA Simulation</Button>
            <Button variant="outline" onClick={onAccessWorkflowBuilder}>Access Workflow Builder</Button>
            <Button onClick={onLaunchNewAgent}>Launch New Agent</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agentsWithAlerts.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onClick={() => handleAgentClick(agent)} onEdit={(e) => { e.stopPropagation(); onEditAgent(agent); }} hasTriggeredAlert={agent.hasTriggeredAlert} />
        ))}
         {agents.length === 0 && (
          <div className="col-span-full text-center py-12 border-2 border-dashed border-brand-border rounded-lg">
            <h3 className="text-lg font-semibold">No Agents Found</h3>
            <p className="text-brand-text-dark mt-1">Get started by launching your first agent for this project.</p>
            <Button onClick={onLaunchNewAgent} className="mt-4">Launch Agent</Button>
          </div>
        )}
      </div>

      {selectedAgentWithAlerts && (
        <AgentProfileModal
          agent={selectedAgentWithAlerts}
          alerts={selectedAgentWithAlerts.alerts}
          isAlertTriggered={(alert) => isAlertTriggered(selectedAgentWithAlerts, alert)}
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onEdit={onEditAgent}
          onStartLiveConversation={onStartLiveConversation}
          onAddAlert={onAddAlert}
          onDeleteAlert={onDeleteAlert}
          onToggleOnCall={onToggleAgentOnCall}
        />
      )}

      <QASimulationModal 
        isOpen={isQAModalOpen}
        onClose={() => setIsQAModalOpen(false)}
        project={project}
      />
    </div>
  );
};

export default ProjectDetailView;