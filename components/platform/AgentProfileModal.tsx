import React, { useState } from 'react';
import { Agent, Alert, AlertCondition, AlertMetric } from '../../types';
import { Modal } from '../ui/Modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { LineChart } from '../ui/LineChart';
import { BarChart } from '../ui/BarChart';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OnCallSwitch } from './OnCallSwitch';

interface AgentProfileModalProps {
  agent: Agent;
  alerts: Alert[];
  isAlertTriggered: (alert: Alert) => boolean;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (agent: Agent) => void;
  onStartLiveConversation: (agent: Agent) => void;
  onAddAlert: (alertData: Omit<Alert, 'id'>) => void;
  onDeleteAlert: (alertId: string) => void;
  onToggleOnCall: (agentId: string) => void;
}

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

export const AgentProfileModal: React.FC<AgentProfileModalProps> = ({ 
    agent, 
    alerts,
    isAlertTriggered,
    isOpen, 
    onClose, 
    onEdit, 
    onStartLiveConversation,
    onAddAlert,
    onDeleteAlert,
    onToggleOnCall
}) => {

    const [newAlertMetric, setNewAlertMetric] = useState<AlertMetric>('fcr');
    const [newAlertCondition, setNewAlertCondition] = useState<AlertCondition>('less than');
    const [newAlertThreshold, setNewAlertThreshold] = useState('');

    const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div>
            <div className="text-sm text-brand-text-dark">{label}</div>
            <div className="font-semibold text-brand-text-light">{value}</div>
        </div>
    );
    
    const performanceData = {
        fcr: agent.performanceHistory.map(h => ({ x: h.date, y: h.fcr })),
        escalation: agent.performanceHistory.map(h => ({ x: h.date, y: h.escalationRate })),
        aht: agent.performanceHistory.map(h => ({ x: h.date, y: h.aht })),
    };

    const versionChanges = agent.performanceHistory
        .filter(h => h.versionChange)
        .map(h => ({ date: h.date, label: h.versionChange! }));
        
    const handleCreateAlert = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAlertThreshold) return;
        onAddAlert({
            agentId: agent.id,
            metric: newAlertMetric,
            condition: newAlertCondition,
            threshold: Number(newAlertThreshold),
        });
        setNewAlertThreshold('');
    };

    const metricLabels: Record<AlertMetric, string> = {
        fcr: 'FCR (%)',
        escalationRate: 'Escalation Rate (%)',
        sentimentScore: 'Sentiment Score (0-1)',
    };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Agent Profile: ${agent.name}`}>
        <div className="space-y-6">
            {/* Biography & Identity */}
            <section>
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative">
                    <img src={agent.avatarUrl} alt={agent.name} className="w-24 h-24 rounded-full border-4 border-brand-border" />
                    {agent.onCall && (
                        <div className="absolute top-0 right-0" title="Agent is On Call">
                            <span className="relative flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-brand-bg-light"></span>
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">Auto-Generated Biography</h3>
                    <p className="text-sm text-brand-text-dark mt-1">
                        Derived from the agent's initial prompt and top 5 most-used workflows.
                    </p>
                  </div>
                   <OnCallSwitch on={agent.onCall} setOn={() => onToggleOnCall(agent.id)} />
                </div>
                <p className="mt-2 text-sm bg-brand-bg p-3 rounded-md">{agent.backstory}</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-brand-bg rounded-lg">
                <Stat label="Personality" value={agent.personality} />
                <Stat label="Greeting" value={`"${agent.greeting}"`} />
                <Stat label="Voice Profile" value={`${agent.voiceProfile.gender}, ${agent.voiceProfile.region}, ${agent.voiceProfile.style}`} />
                <Stat label="TTS Model" value={agent.ttsModel} />
            </div>
            </section>

             {/* Performance Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Alerts</CardTitle>
                    <CardDescription>Set up automatic notifications for key metric thresholds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {alerts.map(alert => {
                            const triggered = isAlertTriggered(alert);
                            return (
                                <div key={alert.id} className={`flex items-center justify-between p-2 rounded-md ${triggered ? 'bg-red-500/10' : 'bg-brand-bg'}`}>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className={`w-2 h-2 rounded-full ${triggered ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                        <span>Alert when <strong>{metricLabels[alert.metric]}</strong> is <strong>{alert.condition} {alert.threshold}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${triggered ? 'text-red-400' : 'text-green-400'}`}>
                                            {triggered ? 'TRIGGERED' : 'OK'}
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteAlert(alert.id)}>
                                            <TrashIcon />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        {alerts.length === 0 && <p className="text-sm text-center text-brand-text-dark py-4">No alerts configured for this agent.</p>}
                    </div>
                    <form onSubmit={handleCreateAlert} className="flex flex-col md:flex-row items-end gap-2 p-3 bg-brand-bg-light rounded-lg border border-brand-border">
                         <div className="flex-1 w-full md:w-auto">
                            <label className="text-xs font-medium text-brand-text-dark">Metric</label>
                            <select value={newAlertMetric} onChange={e => setNewAlertMetric(e.target.value as AlertMetric)} className="w-full h-9 bg-brand-bg border border-brand-border rounded-md px-2 text-sm">
                                <option value="fcr">FCR</option>
                                <option value="escalationRate">Escalation Rate</option>
                                <option value="sentimentScore">Sentiment Score</option>
                            </select>
                         </div>
                          <div className="flex-1 w-full md:w-auto">
                            <label className="text-xs font-medium text-brand-text-dark">Condition</label>
                             <select value={newAlertCondition} onChange={e => setNewAlertCondition(e.target.value as AlertCondition)} className="w-full h-9 bg-brand-bg border border-brand-border rounded-md px-2 text-sm">
                                <option value="less than">Less Than</option>
                                <option value="greater than">Greater Than</option>
                            </select>
                         </div>
                          <div className="flex-1 w-full md:w-auto">
                            <label className="text-xs font-medium text-brand-text-dark">Threshold</label>
                            <Input type="number" step="0.1" value={newAlertThreshold} onChange={e => setNewAlertThreshold(e.target.value)} placeholder="e.g., 80" className="h-9"/>
                         </div>
                        <Button type="submit" size="sm" className="w-full md:w-auto">Add Alert</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Lifetime Performance Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Lifetime Performance Metrics (Last 30 Days)</CardTitle>
                    <CardDescription>Correlate performance dips/spikes with model updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <LineChart 
                        data={[
                            { id: 'FCR', color: '#00B88A', data: performanceData.fcr },
                            { id: 'Escalation', color: '#f87171', data: performanceData.escalation }
                        ]} 
                        yLabel="Percentage (%)"
                        markers={versionChanges}
                    />
                    <LineChart 
                        data={[
                            { id: 'AHT', color: '#0057FF', data: performanceData.aht }
                        ]} 
                        yLabel="Avg Handle Time (s)"
                    />
                </CardContent>
            </Card>

            {/* Audience Segmentation Insights */}
            <Card>
                <CardHeader>
                    <CardTitle>Audience Segmentation Insights</CardTitle>
                    <CardDescription>Identify optimization opportunities by visualizing segmented performance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BarChart 
                        data={agent.audienceSegments.map(s => ({
                            label: s.segment.split(':')[1].trim().replace(/"/g, ''),
                            values: {
                                'FCR (%)': s.fcr,
                                'Sentiment': s.sentimentScore * 100,
                            }
                        }))}
                        colors={{ 'FCR (%)': '#00B88A', 'Sentiment': '#0057FF' }}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-brand-border mt-6">
            <Button variant="outline" onClick={() => onEdit(agent)}>Edit Agent Profile</Button>
            <Button onClick={() => onStartLiveConversation(agent)}>Start Live Conversation</Button>
        </div>
    </Modal>
  );
};