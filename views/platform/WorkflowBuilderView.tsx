import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Project, WorkflowNode, NodeType, Edge, ApiTool, Workflow } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DraggableNode } from '../../components/platform/WorkflowNode';
import { WorkflowConfigPanel } from '../../components/platform/WorkflowConfigPanel';

interface WorkflowBuilderViewProps {
  project: Project | undefined;
  apiTools: ApiTool[];
  workflows: Workflow[];
  onBack: () => void;
}

const StartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const LLMIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>;
const ToolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const ConditionalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 015 3h12a1 1 0 01.707 1.707L15 8v4l2.707 3.293A1 1 0 0117 17H5a1 1 0 01-.707-1.707L7 12V8L4.293 4.707A1 1 0 013 4v-.707z" clipRule="evenodd" /></svg>;
const DataIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" /><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343-7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" /><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" /></svg>;
const EndIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>;

const nodeTypes: { type: NodeType; title: string; description: string; icon: React.ReactNode }[] = [
    { type: 'Start', title: 'Start Node', description: 'Entry point for workflow execution.', icon: <StartIcon/> },
    { type: 'LLM', title: 'LLM Node', description: 'Executes a pure LLM turn.', icon: <LLMIcon/> },
    { type: 'Tool', title: 'Tool Node', description: 'Calls an external API.', icon: <ToolIcon/> },
    { type: 'Conditional', title: 'Conditional Node', description: 'Decision gate based on logic.', icon: <ConditionalIcon/> },
    { type: 'Data', title: 'Data Node', description: 'Reads/writes to state memory.', icon: <DataIcon/> },
    { type: 'End', title: 'End Node', description: 'Completes the workflow.', icon: <EndIcon/> },
];

const NodePaletteItem: React.FC<{ nodeType: typeof nodeTypes[0], onDragStart: (e: React.DragEvent, type: NodeType, data: any) => void }> = ({ nodeType, onDragStart }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, nodeType.type, { title: nodeType.title, description: nodeType.description })}
        className="p-3 border border-brand-border rounded-md cursor-grab bg-brand-bg-light hover:bg-brand-bg hover:border-brand-primary/50 active:cursor-grabbing"
    >
        <div className="flex items-center gap-3">
            <div className="text-brand-primary">{nodeType.icon}</div>
            <div>
                <h4 className="font-semibold text-sm">{nodeType.title}</h4>
                <p className="text-xs text-brand-text-dark">{nodeType.description}</p>
            </div>
        </div>
    </div>
);

const initialNodes: WorkflowNode[] = [
  { id: 'start', type: 'Start', position: { x: 50, y: 200 }, data: { title: 'Start', description: 'Trigger for sales workflow', config: {} } },
  { id: 'llm-qualify', type: 'LLM', position: { x: 250, y: 200 }, data: { title: 'Qualify Lead', description: 'Ask qualifying questions to the user.', config: { prompt: 'To find the best solution for you, could you tell me about your team size and current challenges?' } } },
  { id: 'cond-is-qualified', type: 'Conditional', position: { x: 450, y: 200 }, data: { title: 'Is Lead Qualified?', description: 'Routes based on qualification status.', config: { condition: 'user.interest_score > 7' } } },
  { id: 'tool-schedule-demo', type: 'Tool', position: { x: 650, y: 100 }, data: { title: 'Schedule Demo', description: 'Calls API to schedule a product demo.', config: { toolId: 'tool-3', parameterValues: {} } } },
  { id: 'llm-not-qualified', type: 'LLM', position: { x: 650, y: 300 }, data: { title: 'Nurture Lead', description: 'Provide resources for non-qualified leads.', config: { prompt: 'Thanks for the information. Here are some resources that might be helpful for now...' } } },
  { id: 'tool-update-crm', type: 'Tool', position: { x: 850, y: 200 }, data: { title: 'Update CRM Record', description: 'Log interaction summary to CRM.', config: { toolId: 'tool-1', parameterValues: { customerId: '{session.customerId}', data: '{session.interactionSummary}' } } } },
  { id: 'end', type: 'End', position: { x: 1050, y: 200 }, data: { title: 'End', description: 'End of workflow.', config: {} } },
];

const initialEdges: Edge[] = [
  { id: 'e-start-qualify', source: 'start', target: 'llm-qualify' },
  { id: 'e-qualify-cond', source: 'llm-qualify', target: 'cond-is-qualified' },
  { id: 'e-cond-schedule', source: 'cond-is-qualified', target: 'tool-schedule-demo' },
  { id: 'e-cond-nurture', source: 'cond-is-qualified', target: 'llm-not-qualified' },
  { id: 'e-schedule-crm', source: 'tool-schedule-demo', target: 'tool-update-crm' },
  { id: 'e-nurture-crm', source: 'llm-not-qualified', target: 'tool-update-crm' },
  { id: 'e-crm-end', source: 'tool-update-crm', target: 'end' },
];

const WorkflowBuilderView: React.FC<WorkflowBuilderViewProps> = ({ project, onBack, apiTools, workflows }) => {
  // For now, we just load the first workflow as a default for the builder.
  // A real app would have a selection mechanism.
  const activeWorkflow = workflows[0] || { nodes: initialNodes, edges: initialEdges };

  const [nodes, setNodes] = useState<WorkflowNode[]>(activeWorkflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(activeWorkflow.edges);
  const [drawingEdge, setDrawingEdge] = useState<{ startNodeId: string; startPos: { x: number; y: number }; endPos: { x: number; y: number } } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
        setNodes(nds => nds.filter(n => n.id !== selectedNodeId));
        setEdges(eds => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
        setSelectedNodeId(null);
    }
    if (selectedEdgeId) {
        setEdges(eds => eds.filter(e => e.id !== selectedEdgeId));
        setSelectedEdgeId(null);
    }
  }, [selectedNodeId, selectedEdgeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            handleDeleteSelected();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDeleteSelected]);

  const handleDragStart = (e: React.DragEvent, type: NodeType, data: any) => {
    const config = (() => {
      switch (type) {
        case 'LLM':
          return { prompt: '' };
        case 'Tool':
          return { toolId: null, parameterValues: {} };
        case 'Conditional':
          return { condition: '' };
        case 'Data':
          return { operation: 'write', variableName: '', value: '' };
        default:
          return {};
      }
    })();
    const fullData = { ...data, config };
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ type, data: fullData }));
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const reactFlowBounds = canvasRef.current!.getBoundingClientRect();
    const { type, data } = JSON.parse(e.dataTransfer.getData('application/reactflow'));
    const position = {
      x: e.clientX - reactFlowBounds.left - pan.x,
      y: e.clientY - reactFlowBounds.top - pan.y,
    };

    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data,
    };
    setNodes((nds) => nds.concat(newNode));
  }, [pan]);
  
  const handleNodeDrag = (id: string, newPosition: { x: number; y: number }) => {
    setNodes(nds => nds.map(node => node.id === id ? { ...node, position: newPosition } : node));
  };
  
  const handleStartDrawingEdge = useCallback((startNodeId: string, startHandlePosition: { x: number; y: number }) => {
    setDrawingEdge({
      startNodeId,
      startPos: startHandlePosition,
      endPos: startHandlePosition
    });
  }, []);

  const handleDrawEdgeMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawingEdge || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDrawingEdge(prev => ({
      ...prev!,
      endPos: { x: e.clientX - rect.left - pan.x, y: e.clientY - rect.top - pan.y }
    }));
  }, [drawingEdge, pan]);
  
  const handleDrawEdgeMouseUp = useCallback(() => {
    setDrawingEdge(null);
  }, []);
  
  const handleCompleteEdge = useCallback((targetNodeId: string) => {
    if (!drawingEdge) return;
    const newEdge: Edge = {
      id: `edge-${drawingEdge.startNodeId}-${targetNodeId}`,
      source: drawingEdge.startNodeId,
      target: targetNodeId,
    };
    // Avoid duplicate edges
    if (!edges.some(e => e.source === newEdge.source && e.target === newEdge.target)) {
        setEdges(prev => [...prev, newEdge]);
    }
    setDrawingEdge(null);
  }, [drawingEdge, edges]);

  const handlePanMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    const startPos = { x: e.clientX, y: e.clientY };
    const startPan = { ...pan };
    if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
    }

    const handlePanMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startPos.x;
        const dy = moveEvent.clientY - startPos.y;
        setPan({
            x: startPan.x + dx,
            y: startPan.y + dy,
        });
    };

    const handlePanMouseUp = () => {
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'grab';
        }
        document.removeEventListener('mousemove', handlePanMouseMove);
        document.removeEventListener('mouseup', handlePanMouseUp);
    };

    document.addEventListener('mousemove', handlePanMouseMove);
    document.addEventListener('mouseup', handlePanMouseUp);
  }, [pan]);


  const getEdgePath = (sourceNode: WorkflowNode, targetNode: WorkflowNode) => {
    const sourcePos = { x: sourceNode.position.x + 160, y: sourceNode.position.y + 30 };
    const targetPos = { x: targetNode.position.x, y: targetNode.position.y + 30 };
    const dx = Math.abs(sourcePos.x - targetPos.x) * 0.5;
    return `M ${sourcePos.x},${sourcePos.y} C ${sourcePos.x + dx},${sourcePos.y} ${targetPos.x - dx},${targetPos.y} ${targetPos.x},${targetPos.y}`;
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  
  const handleUpdateNodeConfig = (nodeId: string, newConfig: any) => {
    setNodes(prevNodes => prevNodes.map(node => 
        node.id === nodeId 
            ? { ...node, data: { ...node.data, config: newConfig } } 
            : node
    ));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <Button variant="ghost" onClick={onBack}>&larr; Back to Project</Button>
      </div>
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Node Palette */}
        <aside className="w-80 flex-shrink-0">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-brand-border">
              <h3 className="font-semibold">Core Node Types</h3>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto">
              {nodeTypes.map(nt => <NodePaletteItem key={nt.type} nodeType={nt} onDragStart={handleDragStart} />)}
            </div>
          </Card>
        </aside>

        {/* Canvas and Config Panel Container */}
        <div className="flex-1 relative">
            {/* Canvas */}
            <main 
                ref={canvasRef}
                className="w-full h-full bg-brand-bg-light border border-brand-border rounded-xl relative overflow-hidden bg-grid-pattern cursor-grab"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onMouseMove={handleDrawEdgeMouseMove}
                onMouseUp={handleDrawEdgeMouseUp}
                onMouseDown={handlePanMouseDown}
                onClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-bg/80 pointer-events-none"></div>
                
                <div 
                    className="relative"
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
                >
                    <div className="relative" style={{width: '2200px', height: '800px'}}>
                        <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 1, pointerEvents: 'none' }}>
                            {/* Saved Edges */}
                            {edges.map(edge => {
                                const sourceNode = nodes.find(n => n.id === edge.source);
                                const targetNode = nodes.find(n => n.id === edge.target);
                                if (!sourceNode || !targetNode) return null;
                                const path = getEdgePath(sourceNode, targetNode);
                                const isSelected = edge.id === selectedEdgeId;
                                const sourcePos = { x: sourceNode.position.x + 160, y: sourceNode.position.y + 30 };
                                const targetPos = { x: targetNode.position.x, y: targetNode.position.y + 30 };
                                const midX = (sourcePos.x + targetPos.x) / 2;
                                const midY = (sourcePos.y + targetPos.y) / 2;
                                
                                return (
                                    <g
                                        key={edge.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedEdgeId(edge.id);
                                            setSelectedNodeId(null);
                                        }}
                                        style={{ pointerEvents: 'all' }}
                                    >
                                        <path d={path} stroke={isSelected ? '#4F46E5' : '#9CA3AF'} strokeWidth={isSelected ? 3 : 2} fill="none" className="transition-all" />
                                        <path d={path} stroke="transparent" strokeWidth="20" fill="none" style={{ cursor: 'pointer' }} />
                                        {isSelected && (
                                            <foreignObject x={midX - 10} y={midY - 10} width="20" height="20" style={{ pointerEvents: 'all', overflow: 'visible' }}>
                                                <button
                                                    // @ts-ignore
                                                    xmlns="http://www.w3.org/1999/xhtml"
                                                    className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSelected();
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                            </foreignObject>
                                        )}
                                    </g>
                                );
                            })}
                            {/* Drawing Edge */}
                            {drawingEdge && (
                                <path 
                                d={`M ${drawingEdge.startPos.x} ${drawingEdge.startPos.y} L ${drawingEdge.endPos.x} ${drawingEdge.endPos.y}`} 
                                stroke="#4F46E5" 
                                strokeWidth="2" 
                                fill="none" 
                                strokeDasharray="5,5"
                                />
                            )}
                        </svg>

                        {nodes.map(node => (
                            <DraggableNode
                            key={node.id}
                            node={node}
                            isSelected={node.id === selectedNodeId}
                            onClick={(e, nodeId) => { e.stopPropagation(); setSelectedNodeId(nodeId); setSelectedEdgeId(null); }}
                            onDrag={handleNodeDrag}
                            onStartEdgeDraw={handleStartDrawingEdge}
                            onCompleteEdge={handleCompleteEdge}
                            pan={pan}
                            />
                        ))}
                    </div>
                </div>


                <div className="absolute top-4 right-4 flex gap-2 z-20">
                  <Button variant="outline">Save</Button>
                  <Button>Publish</Button>
                </div>
            </main>
            
            {/* Config Panel */}
            <aside className={`absolute top-0 right-0 h-full w-96 transition-transform duration-300 ease-in-out ${selectedNode ? 'translate-x-0' : 'translate-x-[105%]'}`}>
                {selectedNode && (
                    <WorkflowConfigPanel 
                        key={selectedNode.id}
                        node={selectedNode} 
                        onClose={() => setSelectedNodeId(null)} 
                        onUpdateConfig={handleUpdateNodeConfig}
                        apiTools={apiTools}
                    />
                )}
            </aside>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilderView;
