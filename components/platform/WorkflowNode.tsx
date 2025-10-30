import React, { useState, useRef, useEffect } from 'react';
import { WorkflowNode, NodeType } from '../../types';

interface DraggableNodeProps {
  node: WorkflowNode;
  isSelected: boolean;
  pan: { x: number; y: number };
  onClick: (e: React.MouseEvent, nodeId: string) => void;
  onDrag: (id: string, newPosition: { x: number; y: number }) => void;
  onStartEdgeDraw: (nodeId: string, handlePosition: { x: number; y: number }) => void;
  onCompleteEdge: (nodeId: string) => void;
}

const NodeIcon: React.FC<{ type: NodeType }> = ({ type }) => {
    switch(type) {
        case 'LLM': return <LLMIcon/>;
        case 'Tool': return <ToolIcon/>;
        case 'Conditional': return <ConditionalIcon/>;
        case 'Data': return <DataIcon/>;
        case 'Start': return <PlayIcon/>;
        case 'End': return <StopIcon/>;
        default: return null;
    }
};

export const DraggableNode: React.FC<DraggableNodeProps> = ({ node, isSelected, pan, onClick, onDrag, onStartEdgeDraw, onCompleteEdge }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-handle')) return; // Don't drag node when starting edge
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newPosition = {
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y,
    };
    onDrag(node.id, newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
  };
  
  const handleStartEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    const handleEl = e.target as HTMLDivElement;
    const handleRect = handleEl.getBoundingClientRect();
    const canvasRect = handleEl.closest('main')!.getBoundingClientRect();
    const startPos = {
        x: (handleRect.left + handleRect.right) / 2 - canvasRect.left - pan.x,
        y: (handleRect.top + handleRect.bottom) / 2 - canvasRect.top - pan.y,
    };
    onStartEdgeDraw(node.id, startPos);
  };
  
  const isConnectable = node.type !== 'Start';
  const hasOutput = node.type !== 'End';

  return (
    <div
      ref={nodeRef}
      className={`absolute bg-brand-bg border rounded-lg shadow-lg cursor-grab transition-all ${isDragging ? 'cursor-grabbing' : ''} ${isSelected ? 'border-brand-primary shadow-glow-primary' : 'border-brand-border'}`}
      style={{ left: node.position.x, top: node.position.y, zIndex: 10 }}
      onMouseDown={handleMouseDown}
      onClick={(e) => onClick(e, node.id)}
      onMouseUp={() => onCompleteEdge(node.id)}
    >
      <div className="p-3 w-40">
        <h4 className="font-semibold text-sm flex items-center gap-2">
            <span className="text-brand-text-dark"><NodeIcon type={node.type} /></span>
            {node.data.title}
        </h4>
        <p className="text-xs text-brand-text-dark mt-1">{node.data.description}</p>
      </div>

      {/* Input Handle */}
      {isConnectable && (
          <div className="node-handle input-handle absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-brand-bg border border-brand-primary rounded-full hover:bg-brand-primary" />
      )}
      
      {/* Output Handle */}
      {hasOutput && (
        <div 
          onMouseDown={handleStartEdge}
          className="node-handle output-handle absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-brand-bg border border-brand-primary rounded-full cursor-crosshair hover:bg-brand-primary" 
        />
      )}
    </div>
  );
};


// Icons (Updated solid style)
const LLMIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>;
const ToolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const ConditionalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 015 3h12a1 1 0 01.707 1.707L15 8v4l2.707 3.293A1 1 0 0117 17H5a1 1 0 01-.707-1.707L7 12V8L4.293 4.707A1 1 0 013 4v-.707z" clipRule="evenodd" /></svg>;
const DataIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" /><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" /><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>;