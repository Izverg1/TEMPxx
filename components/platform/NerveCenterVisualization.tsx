import React from 'react';
import { Project, Agent } from '../../types';

interface NerveCenterVisualizationProps {
    projects: Project[];
    agents: Agent[];
}

const getStatusColor = (status: Project['status']) => {
    switch(status) {
        case 'Active': return '#4ade80';
        case 'Optimizing': return '#facc15';
        case 'Error': return '#f87171';
        default: return '#9ca3af';
    }
}

export const NerveCenterVisualization: React.FC<NerveCenterVisualizationProps> = ({ projects, agents }) => {
    const projectNodes = projects.slice(0, 4); // Limit to 4 projects for visual clarity
    
    // Defensive guard to prevent crash if agents array is not yet available.
    if (!agents) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="text-sm text-brand-text-dark">Loading agent data...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center">
             <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } }
            `}</style>
            <div className="relative w-72 h-72">
                {/* Central Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-20 h-20 rounded-full bg-brand-primary/20 flex items-center justify-center border-2 border-brand-primary animate-pulse">
                        <div className="text-center">
                            <div className="text-xs font-bold text-brand-primary">UNITY</div>
                            <div className="text-[10px] text-brand-text-dark">HUB</div>
                        </div>
                    </div>
                </div>

                {/* Project Orbits */}
                {projectNodes.map((project, i) => {
                    const projectAgents = agents.filter(a => a.projectId === project.id).slice(0, 3);
                    const orbitSize = 140 + i * 50;
                    const duration = 20 + i * 10;
                    const color = getStatusColor(project.status);
                    
                    return (
                        <div key={project.id}
                             className="absolute top-1/2 left-1/2 rounded-full border border-dashed border-brand-border"
                             style={{
                                 width: `${orbitSize}px`,
                                 height: `${orbitSize}px`,
                                 marginLeft: `-${orbitSize / 2}px`,
                                 marginTop: `-${orbitSize / 2}px`,
                                 animation: `spin ${duration}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                             }}>
                            
                            {/* Project Node */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ animation: `spin-reverse ${duration}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}` }}>
                                <div className="group relative w-6 h-6 rounded-full border-2" style={{ borderColor: color, backgroundColor: `${color}40`, animation: `pulse 3s ease-in-out infinite` }}>
                                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-brand-bg-light text-brand-text-light text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {project.name}
                                    </div>
                                </div>
                            </div>

                            {/* Agent Particles */}
                            {projectAgents.map((agent, j) => {
                                const agentOrbitSize = 40 + j * 10;
                                const agentDuration = 5 + j * 2;
                                const agentAngle = (j / projectAgents.length) * 360;

                                return (
                                    <div key={agent.id}
                                         className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8"
                                         style={{ 
                                             animation: `spin-reverse ${duration}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                                            transform: `rotate(${agentAngle}deg)`
                                        }}>
                                         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand-border"
                                             style={{
                                                 width: `${agentOrbitSize}px`,
                                                 height: `${agentOrbitSize}px`,
                                                 animation: `spin ${agentDuration}s linear infinite`,
                                             }}>
                                             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full flex items-center justify-center" style={{ animation: `spin-reverse ${agentDuration}s linear infinite` }}>
                                                <div className="group relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}>
                                                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-brand-bg-light text-brand-text-light text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {agent.name}
                                                    </div>
                                                </div>
                                             </div>
                                         </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};