import React, { useState, useEffect, useRef } from 'react';
import { Agent, TranscriptMessage } from '../../types';
import { Button } from '../../components/ui/Button';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../../utils/audioUtils';

interface LiveConversationViewProps {
  agent: Agent;
  onBack: () => void;
}

export const LiveConversationView: React.FC<LiveConversationViewProps> = ({ agent, onBack }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<LiveSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  let nextStartTime = 0;

  useEffect(() => {
    return () => {
      stopSession();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const drawVisualizer = () => {
    if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

    canvasCtx.fillStyle = 'rgb(10, 10, 10)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#0057FF';
    canvasCtx.beginPath();

    const sliceWidth = canvas.width * 1.0 / analyserRef.current.frequencyBinCount;
    let x = 0;

    for (let i = 0; i < analyserRef.current.frequencyBinCount; i++) {
      const v = dataArrayRef.current[i] / 128.0;
      const y = v * canvas.height / 2;
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
    animationFrameRef.current = requestAnimationFrame(drawVisualizer);
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    setTranscript([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Session opened.');
            setIsConnecting(false);
            setIsSessionActive(true);
            drawVisualizer();
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            analyserRef.current = audioContextRef.current!.createAnalyser();
            dataArrayRef.current = new Uint8Array(analyserRef.current!.frequencyBinCount);
            
            source.connect(analyserRef.current);
            analyserRef.current.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob: Blob = {
                  data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32767)).buffer)),
                  mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                nextStartTime = Math.max(nextStartTime, outputAudioContextRef.current.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                const sourceNode = outputAudioContextRef.current.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(outputAudioContextRef.current.destination);
                sourceNode.start(nextStartTime);
                nextStartTime += audioBuffer.duration;
            }
             if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setTranscript(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'user') {
                        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                    }
                    return [...prev, { role: 'user', text, timestamp: Date.now() }];
                });
            } else if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                 setTranscript(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'model') {
                        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                    }
                    return [...prev, { role: 'model', text, timestamp: Date.now() }];
                });
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setError(`Session error: ${e.message}`);
            stopSession();
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed.');
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: agent.personality,
        },
      });

      sessionPromise.then(session => {
        sessionRef.current = session;
      }).catch(err => {
        console.error('Failed to establish session:', err);
        setError('Failed to establish a connection with the agent.');
        setIsConnecting(false);
      });

    } catch (err) {
      console.error('Failed to start session:', err);
      setError('Could not access microphone. Please check permissions.');
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    sessionRef.current?.close();
    sessionRef.current = null;
    
    audioContextRef.current?.close();
    outputAudioContextRef.current?.close();

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;

    setIsSessionActive(false);
    setIsConnecting(false);
  };

  const handleToggleConversation = () => {
    if (isSessionActive || isConnecting) {
      stopSession();
    } else {
      startSession();
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>&larr; Back to Project</Button>
      <div className="bg-brand-bg rounded-lg border border-brand-border p-6 text-center">
        <img src={agent.avatarUrl} alt={agent.name} className="w-24 h-24 rounded-full mx-auto border-4 border-brand-border" />
        <h2 className="text-2xl font-bold mt-4">Live Conversation with {agent.name}</h2>
        <p className="text-brand-text-dark">{agent.useCase}</p>

        <div className="mt-6">
            <canvas ref={canvasRef} width="600" height="100" className="mx-auto bg-brand-bg-light rounded-md"></canvas>
        </div>

        <div className="mt-6">
          <Button onClick={handleToggleConversation} size="lg" disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : isSessionActive ? 'End Conversation' : 'Start Conversation'}
          </Button>
          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </div>
      </div>

      <div className="bg-brand-bg rounded-lg border border-brand-border p-6 space-y-4 min-h-[300px]">
        <h3 className="font-semibold">Live Transcript</h3>
        {transcript.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
             {msg.role === 'model' && <img src={agent.avatarUrl} className="w-8 h-8 rounded-full" />}
             <div className={`rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-brand-bg-light'}`}>
                {msg.text}
             </div>
          </div>
        ))}
         {!isSessionActive && transcript.length === 0 && (
            <p className="text-brand-text-dark text-center pt-8">Transcript will appear here once the conversation starts.</p>
        )}
      </div>
    </div>
  );
};