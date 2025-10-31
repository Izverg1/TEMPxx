import React, { useState } from 'react';
import { Agent, Project, Task, View, Alert, ApiTool, Workflow, WorkflowNode, Edge } from '../types';
import Sidebar from '../components/platform/Sidebar';
import Header from '../components/platform/Header';
import DashboardView from './platform/DashboardView';
import ProjectDetailView from './platform/ProjectDetailView';
import CreateAgentView from './platform/CreateAgentView';
import WorkflowBuilderView from './platform/WorkflowBuilderView';
import { LiveConversationView } from './platform/LiveConversationView';
import TasksView from './platform/TasksView';
import ApiToolsView from './platform/ApiToolsView';


interface PlatformProps {
  onExitPlatform: () => void;
}

// --- MOCK DATA GENERATION ---
const MOCK_PROJECTS: Project[] = [
  { id: 'proj-01', name: 'Retail Support Q4', status: 'Active', budgetUsage: 75, fcr: 82, escalationRate: 12, totalAgents: 3, totalInteractions: 2130, estimatedROI: 12500, phoneNumber: '+1 (800) 555-0101' },
  { id: 'proj-02', name: 'Insurance Onboarding', status: 'Optimizing', budgetUsage: 45, fcr: 76, escalationRate: 18, totalAgents: 2, totalInteractions: 980, estimatedROI: 8700, phoneNumber: '+1 (800) 555-0102' },
  { id: 'proj-03', name: 'Winter Sale Campaign', status: 'Error', budgetUsage: 98, fcr: 65, escalationRate: 25, totalAgents: 1, totalInteractions: 540, estimatedROI: -500, phoneNumber: '+1 (800) 555-0103' },
];

const MOCK_AGENTS: Agent[] = [
    { id: 'agent-001', projectId: 'proj-01', name: 'Athena', avatarUrl: `https://i.pravatar.cc/150?u=athena`, useCase: 'Customer Service', status: 'Active', deploymentType: 'UNITY_Internal', interactions: 1250, fcr: 85, escalationRate: 10, sentimentScore: 0.9, workflowsCompleted: 1100, valueGenerated: 9800, createdAt: '2023-10-26', personality: 'Friendly and empathetic', backstory: 'Designed to assist users with billing inquiries.', greeting: 'Hello! My name is Athena, how can I help you with your account today?', voiceProfile: { gender: 'Female', region: 'US-East', style: 'Enthusiastic' }, ttsModel: 'gemini-2.5-flash-preview-tts', monthlyBudget: 10000, 
    performanceHistory: [
      { date: '2025-09-28', fcr: 82, escalationRate: 12, aht: 110 },
      { date: '2025-09-30', fcr: 83, escalationRate: 11, aht: 105 },
      { date: '2025-10-02', fcr: 81, escalationRate: 13, aht: 115 },
      { date: '2025-10-04', fcr: 85, escalationRate: 10, aht: 100, versionChange: 'v1.1' },
      { date: '2025-10-06', fcr: 87, escalationRate: 9, aht: 95 },
      { date: '2025-10-08', fcr: 86, escalationRate: 10, aht: 98 },
      { date: '2025-10-10', fcr: 88, escalationRate: 8, aht: 92 },
      { date: '2025-10-12', fcr: 85, escalationRate: 11, aht: 105 },
      { date: '2025-10-14', fcr: 84, escalationRate: 12, aht: 110 },
      { date: '2025-10-16', fcr: 80, escalationRate: 15, aht: 120, versionChange: 'v1.2-beta' },
      { date: '2025-10-18', fcr: 78, escalationRate: 17, aht: 125 },
      { date: '2025-10-20', fcr: 81, escalationRate: 14, aht: 118 },
      { date: '2025-10-22', fcr: 85, escalationRate: 10, aht: 102, versionChange: 'v1.2-stable' },
      { date: '2025-10-24', fcr: 86, escalationRate: 9, aht: 100 },
      { date: '2025-10-26', fcr: 85, escalationRate: 10, aht: 101 },
    ], 
    audienceSegments: [
      { segment: 'Age Bucket: 25-34', avgTransactionValue: 75, fcr: 88, sentimentScore: 0.92 },
      { segment: 'Region Code: US-East', avgTransactionValue: 82, fcr: 85, sentimentScore: 0.90 },
      { segment: 'Product Affinity: Apparel', avgTransactionValue: 95, fcr: 91, sentimentScore: 0.95 },
      { segment: 'Age Bucket: 45-54', avgTransactionValue: 65, fcr: 75, sentimentScore: 0.85 },
      { segment: 'Region Code: US-West', avgTransactionValue: 78, fcr: 82, sentimentScore: 0.88 },
    ], onCall: false, workflowId: 'wf-support-standard' },
    { id: 'agent-002', projectId: 'proj-01', name: 'AIDA', avatarUrl: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?q=80&w=1000&auto=format&fit=crop', useCase: 'Sales', status: 'Active', deploymentType: 'UNITY_Internal', interactions: 830, fcr: 72, escalationRate: 20, sentimentScore: 0.8, workflowsCompleted: 650, valueGenerated: 15500, createdAt: '2023-09-15', personality: 'Persuasive and knowledgeable', backstory: 'I am AIDA, an advanced AI sales agent specializing in lead qualification and appointment booking. I analyze customer needs to provide tailored solutions, ensuring a seamless and efficient sales process.', greeting: 'Hi there! I\'m AIDA. I can help you find the perfect product for your needs.', voiceProfile: { gender: 'Male', region: 'US-West', style: 'Professional' }, ttsModel: 'gemini-2.5-flash-preview-tts', monthlyBudget: 15000, performanceHistory: [], audienceSegments: [
      { segment: 'Age Bucket: 35-44', avgTransactionValue: 120, fcr: 75, sentimentScore: 0.85 },
      { segment: 'Product Affinity: Electronics', avgTransactionValue: 250, fcr: 80, sentimentScore: 0.88 },
      { segment: 'Region Code: US-West', avgTransactionValue: 110, fcr: 70, sentimentScore: 0.80 },
    ], onCall: true, workflowId: 'wf-sales-q4' },
    { id: 'agent-003', projectId: 'proj-01', name: 'Helios', avatarUrl: `https://i.pravatar.cc/150?u=helios`, useCase: 'Technical Support', status: 'Training', deploymentType: 'External_Hybrid', interactions: 50, fcr: 95, escalationRate: 2, sentimentScore: 0.95, workflowsCompleted: 48, valueGenerated: 1200, createdAt: '2023-11-01', personality: 'Patient and methodical', backstory: 'Specializes in troubleshooting complex technical issues.', greeting: 'Greetings. I am Helios. Please describe the technical issue you are experiencing.', voiceProfile: { gender: 'Male', region: 'UK', style: 'Calm' }, ttsModel: 'ElevenLabs-v2', monthlyBudget: 7500, performanceHistory: [], audienceSegments: [], onCall: false, workflowId: 'wf-support-standard' },
    { id: 'agent-004', projectId: 'proj-02', name: 'Lyra', avatarUrl: `https://i.pravatar.cc/150?u=lyra`, useCase: 'Onboarding', status: 'Active', deploymentType: 'UNITY_Internal', interactions: 600, fcr: 78, escalationRate: 15, sentimentScore: 0.88, workflowsCompleted: 550, valueGenerated: 7200, createdAt: '2023-10-02', personality: 'Clear and concise', backstory: 'Guides new customers through the setup process.', greeting: 'Welcome! I\'m Lyra, and I\'ll be helping you get started today.', voiceProfile: { gender: 'Female', region: 'US-East', style: 'Professional' }, ttsModel: 'gemini-2.5-flash-preview-tts', monthlyBudget: 8000, performanceHistory: [], audienceSegments: [], onCall: false, workflowId: 'wf-onboarding-welcome' },
    { id: 'agent-005', projectId: 'proj-02', name: 'Caelus', avatarUrl: `https://i.pravatar.cc/150?u=caelus`, useCase: 'Customer Service', status: 'Inactive', deploymentType: 'UNITY_Internal', interactions: 380, fcr: 74, escalationRate: 22, sentimentScore: 0.7, workflowsCompleted: 300, valueGenerated: 3100, createdAt: '2023-08-20', personality: 'Formal and direct', backstory: 'Handles account verification and security.', greeting: 'This is Caelus. I am here to assist with your account.', voiceProfile: { gender: 'Male', region: 'US-West', style: 'Calm' }, ttsModel: 'gemini-2.5-flash-preview-tts', monthlyBudget: 5000, performanceHistory: [], audienceSegments: [], onCall: true },
    { id: 'agent-006', projectId: 'proj-03', name: 'Nova', avatarUrl: `https://i.pravatar.cc/150?u=nova`, useCase: 'Sales', status: 'Active', deploymentType: 'External_Hybrid', interactions: 540, fcr: 65, escalationRate: 25, sentimentScore: 0.6, workflowsCompleted: 350, valueGenerated: 18000, createdAt: '2023-11-05', personality: 'Energetic and persuasive', backstory: 'A high-stakes sales agent for limited-time offers.', greeting: 'Hi! I\'m Nova! Ready to hear about our best deal ever?', voiceProfile: { gender: 'Female', region: 'US-East', style: 'Enthusiastic' }, ttsModel: 'gemini-2.5-flash-preview-tts', monthlyBudget: 12000, performanceHistory: [], audienceSegments: [], onCall: false, workflowId: 'wf-sales-q4' },
];

const MOCK_TASKS: Task[] = [
  { id: 'task-1', projectId: 'proj-01', title: 'Tune Athena\'s personality prompt', description: 'Review recent interactions and refine Athena\'s personality prompt to improve empathy.', status: 'In Progress', assigneeId: 'agent-001', assigneeName: 'Athena', assigneeAvatar: 'https://i.pravatar.cc/150?u=athena', dueDate: '2025-11-15' },
  { id: 'task-2', projectId: 'proj-02', title: 'Build new workflow for policy renewal', description: 'Create a visual workflow for handling inbound calls about policy renewals.', status: 'To Do', assigneeId: 'agent-004', assigneeName: 'Lyra', assigneeAvatar: 'https://i.pravatar.cc/150?u=lyra', dueDate: '2025-11-20' },
  { id: 'task-3', projectId: 'proj-01', title: 'Analyze Orion\'s sales performance', description: 'Generate a report on Orion\'s conversion rates and identify areas for improvement.', status: 'To Do', dueDate: '2025-11-18' },
  { id: 'task-4', projectId: 'proj-03', title: 'Investigate high escalation rate for Nova', description: 'High escalation rate detected for the Winter Sale Campaign. Review transcripts and identify root cause.', status: 'Done', assigneeId: 'agent-006', assigneeName: 'Nova', assigneeAvatar: 'https://i.pravatar.cc/150?u=nova', dueDate: '2025-11-10' },
];

const MOCK_ALERTS: Alert[] = [
  { id: 'alert-1', agentId: 'agent-002', metric: 'escalationRate', condition: 'greater than', threshold: 15 },
  { id: 'alert-2', agentId: 'agent-006', metric: 'sentimentScore', condition: 'less than', threshold: 0.7 },
  { id: 'alert-3', agentId: 'agent-006', metric: 'fcr', condition: 'less than', threshold: 70 },
];

const MOCK_API_TOOLS: ApiTool[] = [
  { id: 'tool-1', name: 'updateCRMRecord', description: 'Updates a customer record in the CRM system.', endpoint: 'https://api.crm.com/v1/customers/{customerId}', httpMethod: 'PUT', parameters: [
    { name: 'customerId', type: 'string', required: true },
    { name: 'interactionSummary', type: 'object', required: true },
  ], apiKeySet: true },
  { id: 'tool-2', name: 'getOrderStatus', description: 'Retrieves the status of an order by its ID.', endpoint: 'https://api.ecommerce.com/v2/orders/{orderId}', httpMethod: 'GET', parameters: [
    { name: 'orderId', type: 'string', required: true },
  ], apiKeySet: true },
  { id: 'tool-3', name: 'scheduleAppointment', description: 'Books a new appointment for a customer.', endpoint: 'https://api.scheduler.com/appointments', httpMethod: 'POST', parameters: [
    { name: 'customerId', type: 'string', required: true },
    { name: 'dateTime', type: 'string', required: true },
    { name: 'duration', type: 'number', required: false },
  ], apiKeySet: false },
  { id: 'tool-4', name: 'searchKnowledgeBase', description: 'Searches the internal knowledge base for articles related to a query.', endpoint: 'https://api.internal-kb.com/search', httpMethod: 'GET', parameters: [
    { name: 'query', type: 'string', required: true },
    { name: 'filterByCategory', type: 'string', required: false },
  ], apiKeySet: true },
];

const MOCK_WORKFLOWS_DATA: Workflow[] = [
    {
        id: 'wf-sales-q4',
        name: 'Q4 Sales Inquiry Flow',
        nodes: [
            { id: 'n1', type: 'Start', position: { x: 0, y: 0 }, data: { title: 'Incoming Lead', description: '', config: {} } },
            { id: 'n2', type: 'Tool', position: { x: 0, y: 0 }, data: { title: 'Adding New Contact', description: '', config: {} } },
            { id: 'n3', type: 'Conditional', position: { x: 0, y: 0 }, data: { title: 'Calling', description: '', config: {} } },
            { id: 'n4', type: 'Tool', position: { x: 0, y: 0 }, data: { title: 'Booking Appointment', description: '', config: {} } },
            { id: 'n5', type: 'Tool', position: { x: 0, y: 0 }, data: { title: 'Sending Email', description: '', config: {} } },
            { id: 'n6', type: 'Data', position: { x: 0, y: 0 }, data: { title: 'Adding Information', description: '', config: {} } },
            { id: 'n7', type: 'Tool', position: { x: 0, y: 0 }, data: { title: 'Updating Contact', description: '', config: {} } },
            { id: 'n8', type: 'Tool', position: { x: 0, y: 0 }, data: { title: 'Creating Call Summary', description: '', config: {} } },
            { id: 'n9', type: 'End', position: { x: 0, y: 0 }, data: { title: 'Creating Call Summary', description: '', config: {} } },
        ],
        edges: [
            { id: 'e1-2', source: 'n1', target: 'n2' },
            { id: 'e2-3', source: 'n2', target: 'n3' },
            { id: 'e3-4', source: 'n3', target: 'n4', label: 'Booked' },
            { id: 'e4-5', source: 'n4', target: 'n5' },
            { id: 'e5-8', source: 'n5', target: 'n8' },
            { id: 'e3-6', source: 'n3', target: 'n6', label: 'Info' },
            { id: 'e6-7', source: 'n6', target: 'n7' },
            { id: 'e7-9', source: 'n7', target: 'n9' },
        ]
    },
    // Add other workflows here...
];


const Platform: React.FC<PlatformProps> = ({ onExitPlatform }) => {
  const [view, setView] = useState<View>('dashboard');
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [apiTools, setApiTools] = useState<ApiTool[]>(MOCK_API_TOOLS);
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS_DATA);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const [agentForLiveChat, setAgentForLiveChat] = useState<Agent | null>(null);

  const handleAgentSubmit = (agentData: Omit<Agent, 'id' | 'projectId'> | Agent) => {
    if ('id' in agentData) { // Editing
      setAgents(prev => prev.map(a => a.id === agentData.id ? agentData : a));
    } else { // Creating
      if (!selectedProjectId) return;
      const newAgent: Agent = {
        ...(agentData as Omit<Agent, 'id' | 'projectId'>),
        id: `agent-${Date.now()}`,
        avatarUrl: agentData.avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
        interactions: 0,
        createdAt: new Date().toISOString().split('T')[0],
        projectId: selectedProjectId,
        fcr: 100,
        escalationRate: 0,
        sentimentScore: 1,
        workflowsCompleted: 0,
        valueGenerated: 0,
        performanceHistory: [],
        audienceSegments: [],
      };
      setAgents(prev => [...prev, newAgent]);
    }
    setView('project-agents');
    setAgentToEdit(null);
  };
  
  const handleToggleAgentOnCall = (agentId: string) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, onCall: !a.onCall } : a));
  };


  const addProject = (projectData: { name: string; phoneNumber: string }) => {
    const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: projectData.name,
        phoneNumber: projectData.phoneNumber,
        status: 'Active',
        budgetUsage: 0,
        fcr: 0,
        escalationRate: 100,
        totalAgents: 0,
        totalInteractions: 0,
        estimatedROI: 0,
    };
    setProjects(prev => [...prev, newProject]);
  };

  const handleAddTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
    };
    setTasks(prev => [...prev, newTask]);
  };
  
  const handleUpdateTask = (taskId: string, newStatus: Task['status']) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleAddAlert = (alertData: Omit<Alert, 'id'>) => {
    const newAlert: Alert = {
        ...alertData,
        id: `alert-${Date.now()}`,
    };
    setAlerts(prev => [...prev, newAlert]);
  };
  
  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleSaveApiTool = (toolData: Omit<ApiTool, 'id'> | ApiTool) => {
    if ('id' in toolData) {
        setApiTools(prev => prev.map(t => t.id === toolData.id ? toolData : t));
    } else {
        const newTool: ApiTool = { ...toolData, id: `tool-${Date.now()}`};
        setApiTools(prev => [...prev, newTool]);
    }
  };

  const handleDeleteApiTool = (toolId: string) => {
    setApiTools(prev => prev.filter(t => t.id !== toolId));
  }


  const handleSetView = (newView: View) => {
    if (newView === 'project-agents' && !selectedProjectId) {
      setSelectedProjectId(projects[0]?.id || null);
    }
    setView(newView);
  }

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setView('project-agents');
  };
  
  const handleEditAgent = (agent: Agent) => {
    setAgentToEdit(agent);
    setView('edit-agent');
  }
  
  const handleCreateAgent = () => {
    setAgentToEdit(null);
    setView('create-agent');
  }

  const handleStartLiveConversation = (agent: Agent) => {
    setAgentForLiveChat(agent);
    setView('live-conversation');
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const agentsForProject = agents.filter(a => a.projectId === selectedProjectId);

  const renderView = () => {
    switch (view) {
      case 'create-agent':
      case 'edit-agent':
        return <CreateAgentView 
            onAgentSubmit={handleAgentSubmit} 
            onBack={() => { setView('project-agents'); setAgentToEdit(null); }} 
            project={selectedProject} 
            agentToEdit={agentToEdit} 
        />;
      case 'project-agents':
        return <ProjectDetailView 
          project={selectedProject}
          agents={agentsForProject} 
          alerts={alerts}
          workflows={workflows}
          onLaunchNewAgent={handleCreateAgent}
          onAccessWorkflowBuilder={() => setView('workflow-builder')}
          onEditAgent={handleEditAgent}
          onStartLiveConversation={handleStartLiveConversation}
          onAddAlert={handleAddAlert}
          onDeleteAlert={handleDeleteAlert}
          onToggleAgentOnCall={handleToggleAgentOnCall}
        />;
      case 'workflow-builder':
        return <WorkflowBuilderView 
            project={selectedProject} 
            onBack={() => setView('project-agents')} 
            apiTools={apiTools}
            workflows={workflows}
        />;
      case 'live-conversation':
        return agentForLiveChat ? <LiveConversationView agent={agentForLiveChat} onBack={() => setView('project-agents')} /> : null;
      case 'tasks':
        return <TasksView 
            tasks={tasks} 
            projects={projects} 
            agents={agents}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
        />;
      case 'api-tools':
        return <ApiToolsView 
            tools={apiTools}
            onSave={handleSaveApiTool}
            onDelete={handleDeleteApiTool}
        />;
      case 'dashboard':
      default:
        return <DashboardView projects={projects} agents={agents} onSelectProject={handleSelectProject} onAddProject={addProject} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg text-brand-text-light">
      <Sidebar currentView={view} setView={handleSetView} onExit={onExitPlatform} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header project={selectedProject} view={view} projects={projects} onSelectProject={(id) => { setSelectedProjectId(id); setView('project-agents'); }} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg-light p-6 md:p-8 bg-grid-pattern">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Platform;