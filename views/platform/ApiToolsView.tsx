import React, { useState } from 'react';
import { ApiTool } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { ApiToolModal } from '../../components/platform/ApiToolModal';

interface ApiToolsViewProps {
    tools: ApiTool[];
    onSave: (toolData: Omit<ApiTool, 'id'> | ApiTool) => void;
    onDelete: (toolId: string) => void;
}

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;


const ApiToolsView: React.FC<ApiToolsViewProps> = ({ tools, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toolToEdit, setToolToEdit] = useState<ApiTool | null>(null);

    const handleOpenCreateModal = () => {
        setToolToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (tool: ApiTool) => {
        setToolToEdit(tool);
        setIsModalOpen(true);
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>API Tool Definitions</CardTitle>
                    <CardDescription>Manage external API tools available to your agents in the Workflow Builder.</CardDescription>
                </div>
                <Button onClick={handleOpenCreateModal}>Define New Tool</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tool Name</TableHead>
                            <TableHead>HTTP Method</TableHead>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tools.map(tool => (
                            <TableRow key={tool.id}>
                                <TableCell className="font-medium text-brand-primary">{tool.name}</TableCell>
                                <TableCell>
                                    <span className="font-mono text-xs bg-brand-bg-light px-2 py-1 rounded">{tool.httpMethod}</span>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{tool.endpoint}</TableCell>
                                <TableCell className="text-sm text-brand-text-dark max-w-xs truncate">{tool.description}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(tool)}>
                                            <EditIcon />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500/80 hover:text-red-500" onClick={() => onDelete(tool.id)}>
                                            <TrashIcon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                         {tools.length === 0 && (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center text-brand-text-dark py-8">
                                    No API tools defined. Get started by defining a new tool.
                                </TableCell>
                             </TableRow>
                         )}
                    </TableBody>
                </Table>
            </CardContent>
            
            <ApiToolModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSave}
                toolToEdit={toolToEdit}
            />
        </Card>
    );
};

export default ApiToolsView;