import React, { useState, useMemo } from 'react';
import { Agent, Project } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { NerveCenterVisualization } from '../../components/platform/NerveCenterVisualization';
import { Button } from '../../components/ui/Button';
import { CreateProjectModal } from '../../components/platform/CreateProjectModal';

interface DashboardViewProps {
  agents: Agent[];
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onAddProject: (projectData: { name: string; phoneNumber: string }) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ agents, projects, onSelectProject, onAddProject }) => {
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  
  const dashboardStats = useMemo(() => {
    if (projects.length === 0) {
      return { totalROI: 0, weightedFCR: 0, weightedEscalation: 0, totalInteractions: 0 };
    }

    const totalROI = projects.reduce((acc, p) => acc + p.estimatedROI, 0);
    const totalInteractions = projects.reduce((acc, p) => acc + p.totalInteractions, 0);
    
    const weightedFCR = projects.reduce((acc, p) => acc + p.fcr * p.totalInteractions, 0) / totalInteractions;
    const weightedEscalation = projects.reduce((acc, p) => acc + p.escalationRate * p.totalInteractions, 0) / totalInteractions;
    
    return {
      totalROI,
      weightedFCR: isNaN(weightedFCR) ? 0 : weightedFCR,
      weightedEscalation: isNaN(weightedEscalation) ? 0 : weightedEscalation,
    }
  }, [projects]);


  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400';
      case 'Optimizing': return 'bg-yellow-500/20 text-yellow-400';
      case 'Error': return 'bg-red-500/20 text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text-dark">Estimated Total Savings (ROI)</CardTitle>
            <CardDescription className="text-xs">YTD. (Automated Interactions * Avg Cost) - OpEx</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${dashboardStats.totalROI.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text-dark">Aggregate FCR</CardTitle>
            <CardDescription className="text-xs">First Call Resolution across all projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardStats.weightedFCR.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text-dark">Human Escalation Rate</CardTitle>
            <CardDescription className="text-xs">Inverse of FCR across all projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardStats.weightedEscalation.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text-dark">Total Projects</CardTitle>
            <CardDescription className="text-xs">Total number of active projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
                <CardTitle>Project Summary Grid</CardTitle>
                <CardDescription>Granular performance data per project. Click a row to view details.</CardDescription>
            </CardHeader>
            <CardContent>
             <div className="mb-4 text-center">
                 <Button onClick={() => setIsCreateProjectModalOpen(true)}>Create New Project</Button>
             </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>FCR</TableHead>
                    <TableHead>Escalations</TableHead>
                    <TableHead className="text-right">Interactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(project => (
                    <TableRow key={project.id} onClick={() => onSelectProject(project.id)} className="cursor-pointer">
                      <TableCell className="font-medium text-brand-primary hover:underline">{project.name}</TableCell>
                      <TableCell>
                         <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                         </span>
                      </TableCell>
                      <TableCell>{project.fcr}%</TableCell>
                      <TableCell>{project.escalationRate}%</TableCell>
                      <TableCell className="text-right">{project.totalInteractions.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Nerve Center Visualization</CardTitle>
              <CardDescription>Real-time system flow.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <NerveCenterVisualization projects={projects} agents={agents} />
            </CardContent>
        </Card>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onProjectCreate={onAddProject}
      />
    </div>
  );
};

export default DashboardView;