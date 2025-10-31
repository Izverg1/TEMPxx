import React from 'react';
import { Workflow, WorkflowNode, Edge } from '../../types';

interface StaticWorkflowVisualizationProps {
    workflow: Workflow;
}

const ICONS: { [key: string]: { icon: React.ReactNode, color: string } } = {
    'Incoming Lead': { icon: <ChatBubbleIcon />, color: '#FBBF24' },
    'Adding New Contact': { icon: <ContactCardIcon />, color: '#A78BFA' },
    'Calling': { icon: <PhoneIcon />, color: '#34D399' },
    'Booking Appointment': { icon: <CalendarIcon />, color: '#60A5FA' },
    'Sending Email': { icon: <EmailIcon />, color: '#60A5FA' },
    'Adding Information': { icon: <PencilIcon />, color: '#FBBF24' },
    'Updating Contact': { icon: <UpdateContactIcon />, color: '#A78BFA' },
    'Creating Call Summary': { icon: <DocumentIcon />, color: '#F472B6' },
    'default': { icon: <div />, color: '#9CA3AF' },
};

const WorkflowNodeComponent: React.FC<{ node: WorkflowNode, pos: { x: number, y: number } }> = ({ node, pos }) => {
    const { icon, color } = ICONS[node.data.title] || ICONS['default'];
    return (
        <div style={{ position: 'absolute', left: `${pos.x}px`, top: `${pos.y}px`, transform: 'translate(-50%, -50%)' }}>
            <div className="flex flex-col items-center justify-center gap-2">
                <div 
                    className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center"
                    style={{ boxShadow: `0 0 12px ${color}50`}}
                >
                    <div style={{ color, filter: `drop-shadow(0 0 8px ${color})` }}>{icon}</div>
                </div>
                <p className="text-xs text-gray-400 text-center w-20">{node.data.title}</p>
            </div>
        </div>
    );
};

const getEdgePath = (startPos: { x: number, y: number }, endPos: { x: number, y: number }, type: 'straight' | 'curved-down' | 'curved-up') => {
    if (type === 'curved-down') {
        const midX = startPos.x + 50;
        const midY = startPos.y + 40;
        return `M ${startPos.x} ${startPos.y} L ${midX} ${startPos.y} L ${midX} ${midY} L ${endPos.x} ${midY} L ${endPos.x} ${endPos.y}`;
    }
    if (type === 'curved-up') {
        const midX = startPos.x + 50;
        const midY = startPos.y - 40;
        return `M ${startPos.x} ${startPos.y} L ${midX} ${startPos.y} L ${midX} ${midY} L ${endPos.x} ${midY} L ${endPos.x} ${endPos.y}`;
    }
    return `M ${startPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`;
};

export const StaticWorkflowVisualization: React.FC<StaticWorkflowVisualizationProps> = ({ workflow }) => {
    const nodePositions: { [key: string]: { x: number, y: number } } = {
        'n1': { x: 80, y: 100 },
        'n2': { x: 210, y: 100 },
        'n3': { x: 340, y: 100 },
        'n4': { x: 470, y: 40 },
        'n5': { x: 600, y: 40 },
        'n6': { x: 470, y: 160 },
        'n7': { x: 600, y: 160 },
        'n8': { x: 730, y: 40 },
        'n9': { x: 730, y: 160 },
    };

    const Arrow = ({ color = '#4ADE80' }) => (
      <marker id={`arrowhead-${color.replace('#', '')}`} markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill={color} />
      </marker>
    );

    return (
        <div className="mt-4 relative h-[250px] w-full bg-black/20 rounded-lg p-4">
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <Arrow color="#4ADE80" />
                  <Arrow color="#F472B6" />
                </defs>
                {/* Main Path */}
                <path d={getEdgePath(nodePositions['n1'], nodePositions['n2'], 'straight')} stroke="#4ADE80" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-4ADE80)" />
                <path d={getEdgePath(nodePositions['n2'], nodePositions['n3'], 'straight')} stroke="#4ADE80" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-4ADE80)" />
                {/* Branching Paths */}
                <path d={getEdgePath(nodePositions['n3'], nodePositions['n4'], 'curved-up')} stroke="#4ADE80" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-4ADE80)" />
                <path d={getEdgePath(nodePositions['n3'], nodePositions['n6'], 'curved-down')} stroke="#F472B6" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-F472B6)" />
                {/* Top branch */}
                <path d={getEdgePath(nodePositions['n4'], nodePositions['n5'], 'straight')} stroke="#4ADE80" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-4ADE80)" />
                <path d={getEdgePath(nodePositions['n5'], nodePositions['n8'], 'straight')} stroke="#4ADE80" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-4ADE80)" />
                {/* Bottom branch */}
                <path d={getEdgePath(nodePositions['n6'], nodePositions['n7'], 'straight')} stroke="#4ADE80" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-4ADE80)" />
                <path d={getEdgePath(nodePositions['n7'], nodePositions['n9'], 'straight')} stroke="#4ADE80" strokeWidth="2" fill="none" markerEnd="url(#arrowhead-4ADE80)" />
            </svg>
            {workflow.nodes.map(node => (
                nodePositions[node.id] && <WorkflowNodeComponent key={node.id} node={node} pos={nodePositions[node.id]} />
            ))}
        </div>
    );
};

// Icons with glowing filter effect
function ChatBubbleIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>; }
function ContactCardIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="8" x2="16" y1="12" y2="12"/><path d="M11 7h-1"/><path d="M14 17h-1"/></svg>; }
function PhoneIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>; }
function CalendarIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>; }
function EmailIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>; }
function PencilIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>; }
function UpdateContactIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function DocumentIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>; }
