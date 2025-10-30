import React from 'react';

// Industry-specific agent icons
const HealthcareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L12 22M2 12L22 12"/></svg>;
const RetailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const FinanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15A2.5 2.5 0 0 1 9.5 22h-3A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2h3Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15A2.5 2.5 0 0 0 14.5 22h3A2.5 2.5 0 0 0 20 19.5v-15A2.5 2.5 0 0 0 17.5 2h-3Z" /></svg>;

const agents = [
    { id: 'healthcare', icon: <HealthcareIcon />, color: '#34D399', startAngle: 0 },
    { id: 'retail', icon: <RetailIcon />, color: '#FBBF24', startAngle: 120 },
    { id: 'finance', icon: <FinanceIcon />, color: '#60A5FA', startAngle: 240 },
];

export const AgentFactoryAnimation: React.FC = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <style>{`
                @keyframes fadeInScaleUp {
                    0% { opacity: 0; transform: scale(0.5); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px 5px rgba(0, 87, 255, 0.3); }
                    50% { box-shadow: 0 0 35px 12px rgba(0, 87, 255, 0.5); }
                }
                @keyframes data-stream {
                    0% { opacity: 0; transform: scale(0.2) rotate(var(--angle-start)); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: scale(1) rotate(var(--angle-end)); }
                }
                @keyframes deploy-agent {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    20%, 80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(var(--tx), var(--ty)) scale(1.5); opacity: 0; }
                }
            `}</style>

            {/* Central Hub */}
            <div 
                className="w-24 h-24 bg-brand-primary/20 border-2 border-brand-primary rounded-full flex items-center justify-center"
                style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}
            >
                <BrainIcon />
            </div>

            {/* Data Streams In */}
            {[...Array(6)].map((_, i) => (
                <div key={`stream-${i}`} className="absolute w-2 h-2 bg-brand-text-dark rounded-full"
                    style={{
                        top: '50%', left: '50%',
                        '--angle-start': `${i * 60}deg`,
                        '--angle-end': `${i * 60 + 20}deg`,
                        transformOrigin: '200px',
                        animation: `data-stream ${2 + Math.random() * 2}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 2}s`
                    } as React.CSSProperties}
                />
            ))}
            
            {/* Deployed Agents Out */}
            {agents.map((agent, i) => (
                 <div
                    key={agent.id}
                    className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full border flex items-center justify-center"
                    style={{
                        borderColor: agent.color,
                        color: agent.color,
                        '--tx': `${Math.cos((agent.startAngle + 30) * Math.PI / 180) * 300}px`,
                        '--ty': `${Math.sin((agent.startAngle + 30) * Math.PI / 180) * 300}px`,
                        animation: `deploy-agent 6s cubic-bezier(0.25, 1, 0.5, 1) infinite`,
                        animationDelay: `${i * 2}s`,
                    } as React.CSSProperties}
                >
                    {agent.icon}
                </div>
            ))}
        </div>
    );
};