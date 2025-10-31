import React, { useState, useEffect, useRef } from 'react';
import { getChatResponse } from '../../services/geminiService';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Message {
    role: 'user' | 'model';
    text: string;
}

// Icons
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
        <text x="7" y="17.5" fontSize="8" fontWeight="bold" fill="currentColor">12</text>
    </svg>
);
const ProductTourIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><polygon points="10,10 15,12 10,14"></polygon></svg>;
const TalkToSalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

const SuggestionButton: React.FC<{ onClick: () => void; icon: React.ReactNode; text: string }> = ({ onClick, icon, text }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-2 bg-brand-bg border border-brand-border rounded-lg text-left hover:bg-brand-bg-light hover:border-brand-primary/80 transition-colors"
    >
        <div className="flex-shrink-0 text-brand-primary-light">
            {icon}
        </div>
        <span className="font-semibold text-sm text-brand-text-light">{text}</span>
    </button>
);


export const VirtualAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hello! I'm the UNITY assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);
    
    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            setShowSuggestions(true);
            setMessages([
                { role: 'model', text: "Hello! I'm the UNITY assistant. How can I help you today?" }
            ]);
            setInput('');
        }, 300); // Delay to allow for closing animation
    };

    const handleSend = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        if (showSuggestions) {
            setShowSuggestions(false);
        }

        const userMessage: Message = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getChatResponse(messageText);
            const modelMessage: Message = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: Message = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const menuActions = [
        { text: 'Schedule demo', icon: <CalendarIcon />, prompt: 'I would like to schedule a demo.' },
        { text: 'Product tour', icon: <ProductTourIcon />, prompt: 'Can you give me a product tour?' },
        { text: 'Talk to sales', icon: <TalkToSalesIcon />, prompt: 'I would like to talk to sales.' },
    ];

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Popup Window */}
            <div className={`transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="absolute bottom-[calc(100%+1rem)] right-0 w-80 sm:w-96 h-[500px] flex flex-col bg-brand-bg-light border border-brand-border rounded-lg shadow-2xl shadow-brand-primary/20">
                    {/* Header */}
                    <header className="flex items-center justify-between p-3 border-b border-brand-border flex-shrink-0">
                        <h3 className="font-bold text-brand-text-light">UNITY Assistant</h3>
                        <button onClick={handleClose} className="text-brand-text-dark hover:text-brand-text-light">
                        <CloseIcon />
                        </button>
                    </header>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                           <React.Fragment key={index}>
                             <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                     msg.role === 'user' 
                                         ? 'bg-brand-primary text-white' 
                                         : 'bg-brand-bg'
                                 }`}>
                                     {msg.text}
                                 </div>
                             </div>
                              {index === 0 && showSuggestions && (
                                <div className="space-y-2 animate-fadeIn">
                                    {menuActions.map(action => (
                                        <SuggestionButton 
                                            key={action.text} 
                                            onClick={() => handleSend(action.prompt)}
                                            icon={action.icon}
                                            text={action.text}
                                        />
                                    ))}
                                </div>
                              )}
                           </React.Fragment>
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
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
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
