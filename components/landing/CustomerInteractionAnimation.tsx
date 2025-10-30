import React, { useState, useEffect } from 'react';

// Icons
const CustomerIcon = ({ mood }: { mood: 'neutral' | 'happy' }) => (
    <div className={`relative w-12 h-12 rounded-full border-2 ${mood === 'happy' ? 'border-brand-accent' : 'border-brand-text-dark'} flex items-center justify-center transition-colors duration-500`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 16c.5-1.5 2.5-3 5-3s4.5 1.5 5 3" /></svg>
        <div className={`absolute -top-1 -right-1 transition-all duration-500 ${mood === 'happy' ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-6 h-6 bg-brand-bg-light rounded-full flex items-center justify-center text-brand-text-dark font-bold text-sm">?</div>
        </div>
        <div className={`absolute -top-1 -right-1 transition-all duration-500 ${mood === 'happy' ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
        </div>
    </div>
);

const AgentIcon = ({ icon, color }: { icon: React.ReactNode, color: string }) => (
    <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center" style={{ borderColor: color, color }}>
        {icon}
    </div>
);

const SystemIcon: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 bg-brand-bg rounded-lg border border-brand-border flex items-center justify-center text-brand-text-dark">
            {icon}
        </div>
        <p className="text-xs text-brand-text-dark">{label}</p>
    </div>
);

const scenarios = [
    {
        name: 'Retail Agent',
        color: '#FBBF24',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
        systems: [
            { label: 'CRM', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
            { label: 'Inventory API', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
        ]
    },
    {
        name: 'Healthcare Agent',
        color: '#34D399',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L12 22M2 12L22 12"/></svg>,
        systems: [
            { label: 'EHR', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
            { label: 'Scheduler', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
        ]
    }
];

export const CustomerInteractionAnimation: React.FC = () => {
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [phase, setPhase] = useState(0); // 0: init, 1: agent->systems, 2: systems->agent, 3: agent->customer

    useEffect(() => {
        const cycleScenario = () => {
            setCurrentScenarioIndex(prev => (prev + 1) % scenarios.length);
        };
        const timer = setInterval(() => {
            setPhase(p => (p + 1) % 4);
            if (phase === 3) {
                setTimeout(cycleScenario, 1000); // Wait before switching
            }
        }, 2000);
        return () => clearInterval(timer);
    }, [phase]);

    const scenario = scenarios[currentScenarioIndex];

    const getPathStyle = (isActive: boolean) => ({
        strokeDasharray: 5,
        strokeDashoffset: isActive ? 0 : 50,
        transition: 'stroke-dashoffset 0.5s ease-in-out',
    });

    return (
        <div className="w-full h-96 bg-brand-bg-light rounded-2xl border border-brand-border flex flex-col items-center justify-center p-8 overflow-hidden">
            <style>{`
                 @keyframes path-flow { to { stroke-dashoffset: -10; } }
                 .animated-path { animation: path-flow 1s linear infinite; }
            `}</style>
            <div className="flex items-center justify-between w-full mb-6">
                <span className="text-sm font-semibold text-brand-text-dark">CUSTOMER</span>
                <span className="text-sm font-semibold text-brand-text-dark">BACKEND SYSTEMS</span>
            </div>
            
            <div className="relative w-full h-full flex items-center">
                {/* Customer */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <CustomerIcon mood={phase === 3 ? 'happy' : 'neutral'} />
                </div>
                {/* Agent */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <AgentIcon icon={scenario.icon} color={scenario.color} />
                    <p className="text-center text-xs font-bold mt-2" style={{ color: scenario.color }}>{scenario.name}</p>
                </div>
                {/* Systems */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-6">
                    {scenario.systems.map((sys, i) => <SystemIcon key={i} icon={sys.icon} label={sys.label} />)}
                </div>

                {/* Connectors */}
                <svg className="absolute w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Customer <-> Agent */}
                    <path d="M 40 100 C 125 100, 125 100, 230 100" stroke={phase === 3 ? scenario.color : '#4A5568'} strokeWidth="1.5" fill="none" style={getPathStyle(phase === 0 || phase === 3)} className={phase === 0 || phase === 3 ? 'animated-path' : ''} />
                    
                    {/* Agent <-> Systems */}
                    <path d="M 270 100 C 350 100, 350 50, 440 50" stroke={scenario.color} strokeWidth="1.5" fill="none" style={getPathStyle(phase === 1 || phase === 2)} className={phase === 1 || phase === 2 ? 'animated-path' : ''} />
                    <path d="M 270 100 C 350 100, 350 150, 440 150" stroke={scenario.color} strokeWidth="1.5" fill="none" style={getPathStyle(phase === 1 || phase === 2)} className={phase === 1 || phase === 2 ? 'animated-path' : ''} />
                </svg>
            </div>
        </div>
    );
};