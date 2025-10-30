import React, { useState, useEffect, useRef } from 'react';
import { getChatResponse } from '../../services/geminiService';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

export const VirtualAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hello! I'm the UNITY assistant. Ask me anything about the platform." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getChatResponse(input);
            const modelMessage: Message = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: Message = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Chat Window */}
            <div className={`transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="absolute bottom-[calc(100%+1rem)] right-0 w-80 sm:w-96 h-[500px] flex flex-col bg-brand-bg-light border border-brand-border rounded-lg shadow-2xl shadow-brand-primary/20">
                    {/* Header */}
                    <header className="flex items-center justify-between p-3 border-b border-brand-border flex-shrink-0">
                        <h3 className="font-bold text-brand-text-light">UNITY Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-brand-text-dark hover:text-brand-text-light">
                           <CloseIcon />
                        </button>
                    </header>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-brand-primary text-white' 
                                        : 'bg-brand-bg'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                 <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-brand-bg flex items-center gap-2">
                                     <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
                                     <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                                     <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                                 </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {/* Input */}
                    <footer className="p-3 border-t border-brand-border flex-shrink-0">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                            <Input 
                                type="text"
                                placeholder="Ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <SendIcon />
                            </Button>
                        </form>
                    </footer>
                </div>
            </div>

            {/* FAB */}
            <Button 
                onClick={() => setIsOpen(!isOpen)} 
                size="lg" 
                className={`rounded-full w-16 h-16 shadow-lg shadow-brand-primary/40 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <ChatIcon />
            </Button>
        </div>
    );
};