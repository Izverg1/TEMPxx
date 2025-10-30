import React, { useState, useEffect } from 'react';
import { ApiTool, LLMNodeConfig, ToolNodeConfig, ConditionalNodeConfig, DataNodeConfig, WorkflowNode } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface WorkflowConfigPanelProps {
    node: WorkflowNode;
    apiTools: ApiTool[];
    onClose: () => void;
    onUpdateConfig: (nodeId: string, newConfig: any) => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

const LLMNodeEditor: React.FC<{ config: LLMNodeConfig; onUpdate: (newConfig: LLMNodeConfig) => void; }> = ({ config, onUpdate }) => {
    const [prompt, setPrompt] = useState(config.prompt || '');

    const handleBlur = () => {
        onUpdate({ ...config, prompt });
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">LLM Prompt</label>
            <Textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                onBlur={handleBlur}
                placeholder="Enter the prompt for the LLM..." 
                rows={6}
            />
        </div>
    );
};

const ToolNodeEditor: React.FC<{ config: ToolNodeConfig; apiTools: ApiTool[]; onUpdate: (newConfig: ToolNodeConfig) => void; }> = ({ config, apiTools, onUpdate }) => {
    const [selectedToolId, setSelectedToolId] = useState<string | null>(config.toolId);
    const [paramValues, setParamValues] = useState(config.parameterValues || {});

    const selectedTool = apiTools.find(t => t.id === selectedToolId);

    const handleToolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newToolId = e.target.value;
        setSelectedToolId(newToolId);
        onUpdate({ ...config, toolId: newToolId, parameterValues: {} }); // Reset params on change
    };
    
    const handleParamChange = (name: string, value: string) => {
        const newValues = { ...paramValues, [name]: value };
        setParamValues(newValues);
        onUpdate({ ...config, toolId: selectedToolId, parameterValues: newValues });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Select API Tool</label>
                <select 
                    value={selectedToolId || ''} 
                    onChange={handleToolChange}
                    className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-brand-text-light focus:ring-0 focus:shadow-glow-primary"
                >
                    <option value="">-- Select a tool --</option>
                    {apiTools.map(tool => (
                        <option key={tool.id} value={tool.id}>{tool.name}</option>
                    ))}
                </select>
            </div>
            {selectedTool && (
                <div className="space-y-2 border-t border-brand-border pt-4">
                    <h4 className="text-sm font-medium">Parameters</h4>
                    {selectedTool.parameters.map(param => (
                        <div key={param.name} className="space-y-1">
                            <label className="text-xs text-brand-text-dark">{param.name} {param.required && '*'}</label>
                            <Input 
                                value={paramValues[param.name] || ''}
                                onChange={(e) => handleParamChange(param.name, e.target.value)}
                                placeholder={`Enter value for ${param.name}`}
                            />
                        </div>
                    ))}
                     {selectedTool.parameters.length === 0 && <p className="text-xs text-brand-text-dark">This tool has no parameters.</p>}
                </div>
            )}
        </div>
    );
};

const ConditionalNodeEditor: React.FC<{ config: ConditionalNodeConfig; onUpdate: (newConfig: ConditionalNodeConfig) => void; }> = ({ config, onUpdate }) => {
    const [condition, setCondition] = useState(config.condition || '');

    const handleBlur = () => {
        onUpdate({ ...config, condition });
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Condition Logic</label>
            <Input
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                onBlur={handleBlur}
                placeholder="e.g., scratchpad.sentiment < 0.3"
            />
            <p className="text-xs text-brand-text-dark">Enter a boolean expression. Use 'scratchpad' to access state variables.</p>
        </div>
    );
};

const DataNodeEditor: React.FC<{ config: DataNodeConfig; onUpdate: (newConfig: DataNodeConfig) => void; }> = ({ config, onUpdate }) => {
    const [operation, setOperation] = useState(config.operation || 'write');
    const [variableName, setVariableName] = useState(config.variableName || '');
    const [value, setValue] = useState(config.value || '');

    const handleUpdate = (field: keyof DataNodeConfig, newValue: string) => {
        const newConfig = { ...config, operation, variableName, value, [field]: newValue };
        onUpdate(newConfig);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Operation</label>
                <select 
                    value={operation} 
                    onChange={(e) => {
                        const newOp = e.target.value as 'read' | 'write';
                        setOperation(newOp);
                        handleUpdate('operation', newOp);
                    }}
                    className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-brand-text-light focus:ring-0 focus:shadow-glow-primary"
                >
                    <option value="write">Write to Memory</option>
                    <option value="read">Read from Memory</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Variable Name</label>
                <Input 
                    value={variableName}
                    onChange={(e) => setVariableName(e.target.value)}
                    onBlur={() => handleUpdate('variableName', variableName)}
                    placeholder="e.g., user_intent"
                />
            </div>
            {operation === 'write' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Value to Write</label>
                    <Input 
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={() => handleUpdate('value', value)}
                        placeholder="Enter a static value or a variable"
                    />
                     <p className="text-xs text-brand-text-dark">Can be a static value or a variable reference like {'{llm.output}'}.</p>
                </div>
            )}
        </div>
    );
};


export const WorkflowConfigPanel: React.FC<WorkflowConfigPanelProps> = ({ node, apiTools, onClose, onUpdateConfig }) => {
    
    const renderEditor = () => {
        switch (node.type) {
            case 'LLM':
                return <LLMNodeEditor config={node.data.config as LLMNodeConfig} onUpdate={(c) => onUpdateConfig(node.id, c)} />;
            case 'Tool':
                return <ToolNodeEditor config={node.data.config as ToolNodeConfig} apiTools={apiTools} onUpdate={(c) => onUpdateConfig(node.id, c)} />;
            case 'Conditional':
                return <ConditionalNodeEditor config={node.data.config as ConditionalNodeConfig} onUpdate={(c) => onUpdateConfig(node.id, c)} />;
            case 'Data':
                return <DataNodeEditor config={node.data.config as DataNodeConfig} onUpdate={(c) => onUpdateConfig(node.id, c)} />;
            default:
                return <p className="text-sm text-brand-text-dark text-center py-8">This node type has no configurable properties.</p>;
        }
    };
    
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Configure Node</CardTitle>
                    <CardDescription>{node.data.title}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <CloseIcon />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                {renderEditor()}
            </CardContent>
        </Card>
    );
};