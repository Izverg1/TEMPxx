import React, { useState, useEffect } from 'react';
import { ApiTool, ApiToolParameter } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface ApiToolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (toolData: Omit<ApiTool, 'id'> | ApiTool) => void;
    toolToEdit: ApiTool | null;
}

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const initialParam: ApiToolParameter = { name: '', type: 'string', required: true };

export const ApiToolModal: React.FC<ApiToolModalProps> = ({ isOpen, onClose, onSave, toolToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [httpMethod, setHttpMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
    const [parameters, setParameters] = useState<ApiToolParameter[]>([initialParam]);
    const [apiKeySet, setApiKeySet] = useState(true);
    
    useEffect(() => {
        if (toolToEdit) {
            setName(toolToEdit.name);
            setDescription(toolToEdit.description);
            setEndpoint(toolToEdit.endpoint);
            setHttpMethod(toolToEdit.httpMethod);
            setParameters(toolToEdit.parameters.length > 0 ? toolToEdit.parameters : [initialParam]);
            setApiKeySet(toolToEdit.apiKeySet);
        } else {
            // Reset to default for new tool
            setName('');
            setDescription('');
            setEndpoint('');
            setHttpMethod('GET');
            setParameters([initialParam]);
            setApiKeySet(true);
        }
    }, [toolToEdit, isOpen]);

    const handleParamChange = (index: number, field: keyof ApiToolParameter, value: any) => {
        const newParams = [...parameters];
        (newParams[index] as any)[field] = value;
        setParameters(newParams);
    };

    const addParameter = () => setParameters([...parameters, { ...initialParam }]);
    const removeParameter = (index: number) => setParameters(parameters.filter((_, i) => i !== index));

    const handleSubmit = () => {
        const toolData = { name, description, endpoint, httpMethod, parameters: parameters.filter(p => p.name), apiKeySet };
        if (toolToEdit) {
            onSave({ ...toolToEdit, ...toolData });
        } else {
            onSave(toolData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={toolToEdit ? 'Edit API Tool' : 'Define New API Tool'}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Tool Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., getOrderStatus" />
                    </div>
                     <div className="space-y-1">
                        <label className="text-sm font-medium">HTTP Method</label>
                        <select value={httpMethod} onChange={e => setHttpMethod(e.target.value as any)} className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-brand-text-light focus:ring-0 focus:shadow-glow-primary">
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this tool does..." rows={2} />
                </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium">Endpoint URL</label>
                    <Input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://api.example.com/v1/resource/{id}" />
                </div>

                <div className="space-y-2 pt-2">
                    <h4 className="text-sm font-medium">Parameters</h4>
                    {parameters.map((param, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-brand-bg rounded-md">
                            <Input value={param.name} onChange={e => handleParamChange(index, 'name', e.target.value)} placeholder="Param Name" className="flex-1"/>
                            <select value={param.type} onChange={e => handleParamChange(index, 'type', e.target.value)} className="h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-sm text-brand-text-light focus:ring-0 focus:shadow-glow-primary">
                                <option>string</option>
                                <option>number</option>
                                <option>boolean</option>
                                <option>object</option>
                                <option>array</option>
                            </select>
                             <div className="flex items-center gap-2">
                                <input type="checkbox" checked={param.required} onChange={e => handleParamChange(index, 'required', e.target.checked)} id={`required-${index}`} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/>
                                <label htmlFor={`required-${index}`} className="text-sm">Required</label>
                             </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500/80 hover:text-red-500" onClick={() => removeParameter(index)}>
                                <TrashIcon />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addParameter}>Add Parameter</Button>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Tool</Button>
                </div>
            </div>
        </Modal>
    );
};
