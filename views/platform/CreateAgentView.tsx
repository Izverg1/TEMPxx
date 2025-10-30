import React, { useState, useEffect, useRef } from 'react';
import { Agent, Project } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { generateAgentPersona, generateAgentAvatar } from '../../services/geminiService';
import { Progress } from '../../components/ui/Progress';
import { OnCallSwitch } from '../../components/platform/OnCallSwitch';

interface CreateAgentViewProps {
    onAgentSubmit: (agent: Omit<Agent, 'id' | 'projectId'> | Agent) => void;
    onBack: () => void;
    project: Project | undefined;
    agentToEdit?: Agent | null;
}

type Step = 'platform' | 'config' | 'persona' | 'knowledge' | 'workflow' | 'deploy';

interface FileStatus {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'vectorizing' | 'complete' | 'error';
}

const MOCK_WORKFLOWS = [
    { id: 'wf-sales-q4', name: 'Q4 Sales Inquiry Flow', description: 'Handles common questions and routes to sales agents.' },
    { id: 'wf-support-standard', name: 'Standard Support Flow', description: 'Initial triage and troubleshooting for support calls.' },
    { id: 'wf-onboarding-welcome', name: 'New Customer Onboarding', description: 'Welcomes new customers and guides them through setup.' },
];

const PERSONALITY_MAX_LENGTH = 500;
const examplePrompts = [
    { icon: '👠', name: 'Fashion', prompt: 'A friendly and empathetic agent for a high-end fashion brand. The agent should be knowledgeable about current trends and provide styling advice.' },
    { icon: '💼', name: 'Finance', prompt: 'A professional and direct agent for a financial services company. The agent must prioritize security, be accurate with information, and never sound uncertain.' },
    { icon: '✈️', name: 'Travel', prompt: 'An enthusiastic and adventurous agent for a travel agency. The agent should be an expert in exotic destinations and inspire customers to book unique experiences.' },
];

const agentTemplates = {
    'Sales Assistant': {
        useCase: 'Sales' as const,
        prompt: 'A persuasive and knowledgeable sales agent. This agent should be an expert in product features and benefits, confidently handle objections, and guide customers towards a purchase decision. The tone should be enthusiastic but not pushy.'
    },
    'Customer Service Bot': {
        useCase: 'Customer Service' as const,
        prompt: 'An empathetic, patient, and resourceful support agent. This agent must be able to understand user frustration, provide clear step-by-step instructions for troubleshooting, and know when to escalate an issue. The tone should be calm and reassuring.'
    },
    'Technical Support Agent': {
        useCase: 'Technical Support' as const,
        prompt: 'A patient, methodical, and highly knowledgeable technical support agent. This agent should be able to diagnose complex technical issues, provide clear and accurate solutions, and guide users through troubleshooting steps. The tone must be professional and confidence-inspiring.'
    }
}

// Icons for file upload
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const CheckCircle2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;


const CreateAgentView: React.FC<CreateAgentViewProps> = ({ onAgentSubmit, onBack, project, agentToEdit }) => {
    const isEditMode = !!agentToEdit;
    const [step, setStep] = useState<Step>('platform');
    
    // Step 1: Platform
    const [deploymentType, setDeploymentType] = useState<'UNITY_Internal' | 'External_Hybrid'>('UNITY_Internal');
    const [externalPlatform, setExternalPlatform] = useState('');
    const [externalVoice, setExternalVoice] = useState('');

    // Step 2: Config
    const [platformApiKey, setPlatformApiKey] = useState('');
    const [voiceApiKey, setVoiceApiKey] = useState('');
    
    // Step 3: Persona
    const [name, setName] = useState('');
    const [useCase, setUseCase] = useState<'Customer Service' | 'Sales' | 'Technical Support' | 'Onboarding'>('Customer Service');
    const [personalityPrompt, setPersonalityPrompt] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [ttsModel, setTtsModel] = useState<'gemini-2.5-flash-preview-tts' | 'ElevenLabs-v2'>('gemini-2.5-flash-preview-tts');
    
    // Voice Profile State
    const [gender, setGender] = useState<'Female' | 'Male'>('Female');
    const [region, setRegion] = useState<'US-East' | 'US-West' | 'UK'>('US-East');
    const [style, setStyle] = useState<'Enthusiastic' | 'Professional' | 'Calm'>('Professional');

    // Step 4: Knowledge
    const [uploadedFiles, setUploadedFiles] = useState<FileStatus[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 5: Workflow
    const [workflowId, setWorkflowId] = useState<string | undefined>();

    // Step 6: Deploy
    const [monthlyBudget, setMonthlyBudget] = useState<string>('5000');
    const [agentStatus, setAgentStatus] = useState<Agent['status']>('Training');
    const [onCall, setOnCall] = useState(false);

    // Global State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        if (isEditMode && agentToEdit) {
            setName(agentToEdit.name);
            setDeploymentType(agentToEdit.deploymentType);
            setUseCase(agentToEdit.useCase);
            setPersonalityPrompt(agentToEdit.personality);
            if (agentToEdit.avatarUrl.startsWith('data:image')) {
                setAvatar(agentToEdit.avatarUrl.split(',')[1]);
            }
            setTtsModel(agentToEdit.ttsModel as any);
            setGender(agentToEdit.voiceProfile.gender);
            setRegion(agentToEdit.voiceProfile.region);
            setStyle(agentToEdit.voiceProfile.style);
            setWorkflowId(agentToEdit.workflowId);
            setMonthlyBudget(String(agentToEdit.monthlyBudget));
            setAgentStatus(agentToEdit.status);
            setOnCall(agentToEdit.onCall);
        }
    }, [agentToEdit, isEditMode]);
    
    const handleTemplateSelect = (template: keyof typeof agentTemplates) => {
        const selected = agentTemplates[template];
        setUseCase(selected.useCase);
        setPersonalityPrompt(selected.prompt);
    };

    const isInternalDeployment = deploymentType === 'UNITY_Internal';
    const totalSteps = isInternalDeployment ? 5 : 6;

    const getStepProgress = () => {
        const stepOrderInternal = ['platform', 'persona', 'knowledge', 'workflow', 'deploy'];
        const stepOrderExternal = ['platform', 'config', 'persona', 'knowledge', 'workflow', 'deploy'];
        const currentOrder = isInternalDeployment ? stepOrderInternal : stepOrderExternal;
        const currentStepIndex = currentOrder.indexOf(step);
        return ((currentStepIndex + 1) / totalSteps) * 100;
    }

    const stepConfig: { [key in Step]: { title: string } } = {
        'platform': { title: `Step 1/${totalSteps}: Expertise & Platform` },
        'config': { title: `Step 2/${totalSteps}: External Configuration` },
        'persona': { title: `Step ${isInternalDeployment ? 2 : 3}/${totalSteps}: Persona & Voice` },
        'knowledge': { title: `Step ${isInternalDeployment ? 3 : 4}/${totalSteps}: Knowledge & Data` },
        'workflow': { title: `Step ${isInternalDeployment ? 4 : 5}/${totalSteps}: Workflow Mapping` },
        'deploy': { title: `Step ${isInternalDeployment ? 5 : 6}/${totalSteps}: Deployment & Budget` },
    };


    const handleNext = () => {
        setError(null);
        switch (step) {
            case 'platform':
                if (deploymentType === 'External_Hybrid') setStep('config');
                else setStep('persona');
                break;
            case 'config':
                setStep('persona');
                break;
            case 'persona':
                if (!name || !personalityPrompt) {
                    setError('Please fill in Agent Name and Personality.');
                    return;
                }
                setStep('knowledge');
                break;
            case 'knowledge':
                setStep('workflow');
                break;
            case 'workflow':
                setStep('deploy');
                break;
        }
    };
    
    const handleBack = () => {
        setError(null);
        switch (step) {
            case 'config':
                setStep('platform');
                break;
            case 'persona':
                if (deploymentType === 'External_Hybrid') setStep('config');
                else setStep('platform');
                break;
            case 'knowledge':
                setStep('persona');
                break;
            case 'workflow':
                setStep('knowledge');
                break;
            case 'deploy':
                setStep('workflow');
                break;
        }
    }
    
    const handleGenerateAvatar = async () => {
        if (!name || !personalityPrompt) {
            setError("Please provide a name and personality before generating an avatar.");
            return;
        }
        setIsGeneratingAvatar(true);
        setError(null);
        try {
            const generatedAvatar = await generateAgentAvatar(name, personalityPrompt);
            setAvatar(generatedAvatar);
        } catch (err) {
            console.error(err);
            setError('Failed to generate avatar. Please try again.');
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const shouldRegeneratePersona = !isEditMode || (isEditMode && personalityPrompt !== agentToEdit.personality);
            
            const persona = shouldRegeneratePersona
                ? await generateAgentPersona(personalityPrompt, useCase)
                : { personality: agentToEdit.personality, backstory: agentToEdit.backstory, greeting: agentToEdit.greeting };

            const agentData = {
                name,
                useCase,
                status: agentStatus,
                onCall,
                personality: persona.personality,
                backstory: persona.backstory,
                greeting: persona.greeting,
                avatarUrl: avatar ? `data:image/png;base64,${avatar}` : agentToEdit?.avatarUrl || '',
                deploymentType,
                voiceProfile: { gender, region, style },
                ttsModel: ttsModel,
                workflowId,
                monthlyBudget: Number(monthlyBudget) || 0,
            };

            if (isEditMode) {
                onAgentSubmit({ ...agentToEdit, ...agentData });
            } else {
                onAgentSubmit({
                    ...agentData,
                    projectId: project!.id,
                    interactions: 0,
                    fcr: 100,
                    escalationRate: 0,
                    sentimentScore: 1,
                    workflowsCompleted: 0,
                    valueGenerated: 0,
                    createdAt: new Date().toISOString().split('T')[0],
                    performanceHistory: [],
                    audienceSegments: [],
                });
            }
        } catch (err) {
            console.error(err);
            setError('Failed to generate agent persona. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- File Upload Logic ---
    const simulateUpload = (fileId: string) => {
        const uploadInterval = setInterval(() => {
            setUploadedFiles(prev => prev.map(f => {
                if (f.id === fileId && f.status === 'uploading' && f.progress < 100) {
                    return { ...f, progress: f.progress + 10 };
                }
                return f;
            }));
        }, 100);

        setTimeout(() => {
            clearInterval(uploadInterval);
            setUploadedFiles(prev => prev.map(f => {
                if (f.id === fileId) return { ...f, progress: 100, status: 'vectorizing' };
                return f;
            }));

            setTimeout(() => {
                setUploadedFiles(prev => prev.map(f => {
                    if (f.id === fileId) return { ...f, status: 'complete' };
                    return f;
                }));
            }, 1500);
        }, 1100);
    };

    const handleFilesAdded = (files: FileList) => {
        const newFiles: FileStatus[] = Array.from(files)
            .filter(file => ['application/pdf', 'text/plain'].includes(file.type))
            .map(file => ({ id: `${file.name}-${Date.now()}`, file, progress: 0, status: 'uploading' }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
        newFiles.forEach(f => simulateUpload(f.id));
    };

    const handleDragEvents = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent) => { handleDragEvents(e); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { handleDragEvents(e); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        handleDragEvents(e);
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesAdded(e.dataTransfer.files);
        }
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFilesAdded(e.target.files);
    };
    const handleRemoveFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));
    // --- End File Upload Logic ---

    const currentProgress = getStepProgress();

    return (
        <div>
            <Button variant="ghost" onClick={step === 'platform' ? onBack : handleBack} className="mb-4">
                &larr; Back
            </Button>
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                        <CardTitle>{isEditMode ? 'Edit Agent' : 'Agent Generation Wizard'}</CardTitle>
                        <span className="text-sm text-brand-text-dark">{Math.round(currentProgress)}% Complete</span>
                    </div>
                    <Progress value={currentProgress} />
                    <CardDescription className="pt-2">{stepConfig[step].title}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 min-h-[350px]">
                       {step === 'platform' && (
                           <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium mb-2">1. Deployment Type</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                            <button type="button" onClick={() => setDeploymentType('UNITY_Internal')} className={`p-4 rounded-lg border-2 text-left transition-colors ${deploymentType === 'UNITY_Internal' ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border hover:border-brand-primary/50'}`}>
                                                <h4 className="font-semibold">UNITY Internal</h4>
                                                <p className="text-xs text-brand-text-dark">Full LLM, Workflow, TTS and Hosting managed by UNITY.</p>
                                            </button>
                                            <button type="button" onClick={() => setDeploymentType('External_Hybrid')} className={`p-4 rounded-lg border-2 text-left transition-colors ${deploymentType === 'External_Hybrid' ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border hover:border-brand-primary/50'}`}>
                                                <h4 className="font-semibold">External / Hybrid</h4>
                                                <p className="text-xs text-brand-text-dark">Integrate with external providers like Kore.ai for logic or ElevenLabs for voice.</p>
                                            </button>
                                    </div>
                                    {deploymentType === 'External_Hybrid' && (
                                    <div className="space-y-4 pt-4">
                                        <Input value={externalPlatform} onChange={e => setExternalPlatform(e.target.value)} placeholder="External Platform (e.g., Kore.ai)" />
                                        <Input value={externalVoice} onChange={e => setExternalVoice(e.target.value)} placeholder="External Voice Provider (e.g., ElevenLabs)" />
                                    </div>
                                    )}
                                </div>
                           </div>
                       )}
                       {step === 'config' && (
                           <div className="space-y-4">
                               <p className="text-sm">Securely provide credentials for external services.</p>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Platform API Key</label>
                                    <Input type="password" value={platformApiKey} onChange={e => setPlatformApiKey(e.target.value)} placeholder="Enter Platform API Key" />
                                </div>
                                 <div className="space-y-2">
                                    <label className="text-sm font-medium">Voice Provider API Key</label>
                                    <Input type="password" value={voiceApiKey} onChange={e => setVoiceApiKey(e.target.value)} placeholder="Enter Voice API Key" />
                                </div>
                           </div>
                       )}
                       {step === 'persona' && (
                           <div className="space-y-6">
                                <section className="space-y-4">
                                    <h4 className="font-semibold text-base">1. Define Persona</h4>
                                     <div className="space-y-2">
                                        <label className="text-sm font-medium">Use Case Templates (Optional)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {(Object.keys(agentTemplates) as Array<keyof typeof agentTemplates>).map(key => (
                                                <button key={key} type="button" onClick={() => handleTemplateSelect(key)} className="p-3 rounded-lg border-2 border-brand-border text-left hover:border-brand-primary transition-colors">
                                                    <h5 className="font-semibold text-sm">{key}</h5>
                                                    <p className="text-xs text-brand-text-dark mt-1">{agentTemplates[key].prompt.substring(0, 50)}...</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium">Agent Name</label>
                                            <Input id="name" placeholder="e.g., Athena" value={name} onChange={e => setName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="useCase" className="text-sm font-medium">Use Case</label>
                                            <select id="useCase" value={useCase} onChange={e => setUseCase(e.target.value as any)} className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-brand-text-light focus:ring-0 focus:shadow-glow-primary">
                                                <option>Customer Service</option>
                                                <option>Sales</option>
                                                <option>Technical Support</option>
                                                <option>Onboarding</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label htmlFor="personality" className="text-sm font-medium">Personality & Instructions</label>
                                            <span className={`text-xs font-mono ${personalityPrompt.length >= PERSONALITY_MAX_LENGTH ? 'text-red-400' : 'text-brand-text-dark'}`}>
                                                {personalityPrompt.length}/{PERSONALITY_MAX_LENGTH}
                                            </span>
                                        </div>
                                        <Textarea
                                            id="personality"
                                            placeholder="Describe the agent's tone, expertise, and any specific instructions..."
                                            value={personalityPrompt}
                                            onChange={e => setPersonalityPrompt(e.target.value)}
                                            rows={4}
                                            maxLength={PERSONALITY_MAX_LENGTH}
                                        />
                                        <div className="text-xs text-brand-text-dark">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-brand-text-dark">Quick Prompts:</span>
                                                {examplePrompts.map(p => (
                                                    <button key={p.name} type="button" onClick={() => setPersonalityPrompt(p.prompt)} className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-brand-bg-light border border-brand-border rounded-full text-brand-text-dark hover:border-brand-primary hover:text-brand-text-light transition-colors">
                                                        <span>{p.icon}</span>
                                                        <span>{p.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section className="space-y-4">
                                     <h4 className="font-semibold text-base">2. Customize Voice</h4>
                                      <div className="space-y-2">
                                        <label htmlFor="ttsModel" className="text-sm font-medium">TTS Model</label>
                                        <select
                                            id="ttsModel"
                                            value={ttsModel}
                                            onChange={e => setTtsModel(e.target.value as any)}
                                            className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-brand-text-light focus:ring-0 focus:shadow-glow-primary"
                                        >
                                            <option value="gemini-2.5-flash-preview-tts">Gemini TTS</option>
                                            <option value="ElevenLabs-v2">ElevenLabs v2</option>
                                        </select>
                                    </div>
                                     <div className="space-y-2">
                                        <label className="text-sm font-medium">Voice Profile Customization</label>
                                        <div className="grid grid-cols-3 gap-4 p-4 bg-brand-bg rounded-md border border-brand-border">
                                            <div className="space-y-1">
                                                <label htmlFor="gender" className="text-xs text-brand-text-dark">Gender</label>
                                                <select id="gender" value={gender} onChange={e => setGender(e.target.value as any)} className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-sm text-brand-text-light focus:ring-0 focus:shadow-glow-primary">
                                                    <option>Female</option>
                                                    <option>Male</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="region" className="text-xs text-brand-text-dark">Region</label>
                                                <select id="region" value={region} onChange={e => setRegion(e.target.value as any)} className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-sm text-brand-text-light focus:ring-0 focus:shadow-glow-primary">
                                                    <option>US-East</option>
                                                    <option>US-West</option>
                                                    <option>UK</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="style" className="text-xs text-brand-text-dark">Style</label>
                                                <select id="style" value={style} onChange={e => setStyle(e.target.value as any)} className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-sm text-brand-text-light focus:ring-0 focus:shadow-glow-primary">
                                                    <option>Enthusiastic</option>
                                                    <option>Professional</option>
                                                    <option>Calm</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section className="space-y-4">
                                     <h4 className="font-semibold text-base">3. Generate Avatar</h4>
                                     <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-brand-bg flex items-center justify-center overflow-hidden border-2 border-brand-border">
                                            {isGeneratingAvatar ? (<div className="w-6 h-6 border-4 border-t-brand-primary border-brand-bg rounded-full animate-spin"></div>)
                                            : avatar ? (<img src={`data:image/png;base64,${avatar}`} alt="Generated Avatar" className="w-full h-full object-cover" />)
                                            : (<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-brand-text-dark" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>)}
                                        </div>
                                        <div>
                                            <Button type="button" variant="outline" onClick={handleGenerateAvatar} disabled={isGeneratingAvatar || !name || !personalityPrompt}>
                                                {isGeneratingAvatar ? 'Generating...' : 'Generate Avatar'}
                                            </Button>
                                            <p className="text-xs text-brand-text-dark mt-2">Generate a unique avatar based on the agent's name and personality.</p>
                                        </div>
                                    </div>
                                </section>
                        </div>
                       )}
                       {step === 'knowledge' && (
                           <div className="space-y-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept=".pdf,.txt"
                                    multiple
                                />
                                <div
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragEvents}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragging ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border'}`}
                                >
                                    <div className="flex flex-col items-center justify-center text-brand-text-dark">
                                        <UploadIcon />
                                        <p className="mt-2 font-semibold">Drag & drop files here, or click to select</p>
                                        <p className="text-xs mt-1">Supported file types: PDF, TXT</p>
                                    </div>
                                </div>
                                {uploadedFiles.length > 0 && (
                                    <div className="space-y-2 pt-4">
                                        <h4 className="font-medium text-sm">Uploaded Documents</h4>
                                        {uploadedFiles.map(f => (
                                            <div key={f.id} className="flex items-center gap-3 bg-brand-bg p-2 rounded-md">
                                                <div className="text-brand-primary"><FileIcon /></div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium flex justify-between">
                                                        <span>{f.file.name}</span>
                                                        <span className="text-xs text-brand-text-dark">{(f.file.size / 1024).toFixed(1)} KB</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {f.status === 'uploading' && <Progress value={f.progress} className="h-1.5" />}
                                                        {f.status === 'vectorizing' && <div className="w-full h-1.5 bg-brand-primary/20 rounded-full overflow-hidden relative"><div className="absolute h-full w-1/4 bg-brand-primary rounded-full animate-pulse"></div></div>}
                                                        <span className="text-xs text-brand-text-dark w-24 text-right">
                                                            {f.status === 'uploading' && `Uploading ${f.progress}%`}
                                                            {f.status === 'vectorizing' && 'Vectorizing...'}
                                                            {f.status === 'complete' && <span className="flex items-center justify-end text-green-400 gap-1"><CheckCircle2Icon /> Complete</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveFile(f.id)} className="text-brand-text-dark hover:text-white"><XIcon /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                           </div>
                       )}
                       {step === 'workflow' && (
                            <div className="space-y-4">
                                <p className="text-sm text-brand-text-dark">Select a pre-built workflow for this agent to follow. You can customize this later in the Workflow Builder.</p>
                                <div className="space-y-3">
                                    {MOCK_WORKFLOWS.map(wf => (
                                        <button 
                                            key={wf.id} 
                                            type="button" 
                                            onClick={() => setWorkflowId(wf.id)}
                                            className={`w-full p-4 rounded-lg border-2 text-left transition-colors flex items-center gap-4 ${workflowId === wf.id ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border hover:border-brand-primary/50'}`}
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-brand-bg">
                                                {workflowId === wf.id ? (
                                                    <div className="w-5 h-5 rounded-full bg-brand-primary border-4 border-brand-bg-light"></div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-brand-text-dark"></div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{wf.name}</h4>
                                                <p className="text-xs text-brand-text-dark">{wf.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                       )}
                       {step === 'deploy' && (
                           <div className="space-y-6">
                               <h3 className="font-semibold">Deployment & Budget</h3>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="budget" className="text-sm font-medium">Monthly Budget Limit ($)</label>
                                        <Input 
                                        id="budget" 
                                        type="number" 
                                        placeholder="5000" 
                                        value={monthlyBudget} 
                                        onChange={(e) => setMonthlyBudget(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="status" className="text-sm font-medium">Initial Status</label>
                                        <select id="status" value={agentStatus} onChange={e => setAgentStatus(e.target.value as Agent['status'])} className="w-full h-10 bg-brand-bg-light border border-brand-border rounded-md px-3 text-brand-text-light focus:ring-0 focus:shadow-glow-primary">
                                            <option>Training</option>
                                            <option>Active</option>
                                            <option>Inactive</option>
                                        </select>
                                    </div>
                               </div>
                               <div className="space-y-2">
                                    <label className="text-sm font-medium">On Call Status</label>
                                    <div className="p-3 bg-brand-bg border border-brand-border rounded-md flex items-center justify-between">
                                        <p className="text-sm text-brand-text-dark">Make this agent immediately available to take calls upon creation.</p>
                                        <OnCallSwitch on={onCall} setOn={setOnCall} />
                                    </div>
                               </div>

                           </div>
                       )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                         <div>{error && <p className="text-red-500 text-sm">{error}</p>}</div>
                         <div className="flex gap-2">
                             {step !== 'deploy' ? (
                                <Button type="button" onClick={handleNext}>Next &rarr;</Button>
                             ) : (
                                <Button type="submit" disabled={isLoading || isGeneratingAvatar}>
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating Persona...
                                        </>
                                    ) : (
                                        isEditMode ? 'Update Agent' : 'Create Agent'
                                    )}
                                </Button>
                             )}
                         </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default CreateAgentView;