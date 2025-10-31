export interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Optimizing' | 'Error';
  budgetUsage: number; // as a percentage
  fcr: number; // as a percentage
  escalationRate: number; // as a percentage
  totalAgents: number;
  totalInteractions: number;
  estimatedROI: number; // in USD
  phoneNumber: string;
}

export interface AgentPerformanceHistory {
  date: string; // YYYY-MM-DD
  fcr: number;
  escalationRate: number;
  aht: number; // Average Handle Time in seconds
  versionChange?: string; // e.g., "v1.1"
}

export interface AgentAudienceSegment {
  segment: string;
  avgTransactionValue: number;
  fcr: number;
  sentimentScore: number; // 0 to 1
}

export interface Agent {
  id: string;
  projectId: string;
  name: string;
  avatarUrl: string;
  useCase: 'Customer Service' | 'Sales' | 'Technical Support' | 'Onboarding';
  status: 'Active' | 'Inactive' | 'Training';
  deploymentType: 'UNITY_Internal' | 'External_Hybrid';
  onCall: boolean;
  workflowId?: string; // Link to a workflow

  // Performance Metrics
  interactions: number;
  fcr: number; // First Call Resolution percentage
  escalationRate: number; // percentage
  sentimentScore: number; // 0 to 1
  workflowsCompleted: number;
  valueGenerated: number; // in USD

  // Profile
  personality: string;
  backstory: string;
  greeting: string;
  voiceProfile: {
    gender: 'Female' | 'Male';
    region: 'US-East' | 'US-West' | 'UK';
    style: 'Enthusiastic' | 'Professional' | 'Calm';
  };
  ttsModel: string;
  monthlyBudget: number;
  
  createdAt: string;

  // Detailed Metrics for Audit Trail
  performanceHistory: AgentPerformanceHistory[];
  audienceSegments: AgentAudienceSegment[];
}

// --- Task Management Types ---
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assigneeId?: string; // Agent ID
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate: string; // YYYY-MM-DD
}

// --- Performance Alert Types ---
export type AlertMetric = 'fcr' | 'escalationRate' | 'sentimentScore';
export type AlertCondition = 'less than' | 'greater than';

export interface Alert {
  id: string;
  agentId: string;
  metric: AlertMetric;
  condition: AlertCondition;
  threshold: number;
}

// --- Workflow Builder Types ---
export type NodeType = 'LLM' | 'Tool' | 'Conditional' | 'Data' | 'Start' | 'End';

export interface LLMNodeConfig {
    prompt: string;
}

export interface ToolNodeConfig {
    toolId: string | null;
    parameterValues: Record<string, string>; // Maps parameter name to value/variable
}

export interface ConditionalNodeConfig {
    condition: string; // e.g., "scratchpad.sentiment < 0.3"
}

export interface DataNodeConfig {
    operation: 'read' | 'write';
    variableName: string;
    value: string; // can be a static value or a variable from another source
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    title: string;
    description: string;
    config: LLMNodeConfig | ToolNodeConfig | ConditionalNodeConfig | DataNodeConfig | {};
  };
}


export interface Edge {
    id: string;
    source: string;
    target: string;
    label?: string; // e.g., 'Yes' or 'No' for conditional branches
}

export interface Workflow {
    id: string;
    name: string;
    nodes: WorkflowNode[];
    edges: Edge[];
}

// --- API Tool Types ---
export interface ApiToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
}

export interface ApiTool {
    id: string;
    name: string;
    description: string;
    endpoint: string;
    httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
    parameters: ApiToolParameter[];
    apiKeySet: boolean;
}

// --- Live Conversation Types ---
export interface TranscriptMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type View = 'dashboard' | 'project-agents' | 'workflow-builder' | 'live-conversation' | 'create-agent' | 'edit-agent' | 'tasks' | 'api-tools';