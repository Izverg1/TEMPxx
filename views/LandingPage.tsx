import React, { useRef } from 'react';
import { AgentFactoryAnimation } from '../components/landing/AgentFactoryAnimation';
import { Button } from '../components/ui/Button';
import { VirtualAssistant } from '../components/landing/VirtualAssistant';
import ShootingStars from '../components/landing/ShootingStars';
import { Input } from '../components/ui/Input';
import { CustomerInteractionAnimation } from '../components/landing/CustomerInteractionAnimation';


interface LandingPageProps {
  onEnterPlatform: () => void;
}

const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-4xl font-bold text-white">{value}</p>
    <p className="text-brand-text-dark mt-1">{label}</p>
  </div>
);

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-brand-text-dark mt-1">{children}</p>
    </div>
  </div>
);

const FAQItem: React.FC<{ question: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ question, children, defaultOpen = false }) => (
  <details className="group border-b border-brand-border py-4" open={defaultOpen}>
    <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
      <span className="text-white group-hover:text-brand-primary">{question}</span>
      <span className="transition group-open:rotate-180">
        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
      </span>
    </summary>
    <p className="text-brand-text-dark mt-3 group-open:animate-fadeIn">{children}</p>
  </details>
);


// Icons
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46,6C21.69,6.35,20.86,6.58,20,6.69C20.88,6.16,21.56,5.32,21.88,4.31C21.05,4.81,20.13,5.16,19.16,5.36C18.37,4.5,17.26,4,16,4C13.65,4,11.73,5.92,11.73,8.29C11.73,8.63,11.77,8.96,11.84,9.27C8.28,9.09,5.11,7.38,3,4.79C2.63,5.42,2.42,6.16,2.42,6.94C2.42,8.43,3.17,9.75,4.33,10.5C3.62,10.5,2.96,10.3,2.38,10C2.38,10,2.38,10,2.38,10.03C2.38,12.11,3.86,13.85,5.82,14.24C5.46,14.34,5.08,14.39,4.69,14.39C4.42,14.39,4.15,14.36,3.89,14.31C4.43,16.03,6.02,17.25,7.89,17.29C6.43,18.45,4.58,19.13,2.56,19.13C2.22,19.13,1.88,19.11,1.54,19.07C3.44,20.29,5.7,21,8.12,21C16,21,20.33,14.46,20.33,8.79C20.33,8.6,20.33,8.42,20.32,8.23C21.16,7.63,21.88,6.87,22.46,6Z"></path></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19M18.5,18.5V13.2A3.26,3.26 0 0,0 15.24,9.94C14.39,9.94 13.4,10.43 12.9,11.2V10.13H10.13V18.5H12.9V13.57C12.9,12.8 13.5,12.17 14.31,12.17A1.4,1.4 0 0,1 15.71,13.57V18.5H18.5M6.88,8.56A1.68,1.68 0 0,0 8.56,6.88C8.56,6 7.78,5.2 6.88,5.2A1.69,1.69 0 0,0 5.2,6.88C5.2,7.78 6,8.56 6.88,8.56M8.27,18.5V10.13H5.5V18.5H8.27Z"></path></svg>;
const DiscordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.3,3.7C18.9,3.1,17.4,2.8,15.9,2.6C15.8,2.9,15.7,3.2,15.6,3.5C14.5,3.2,13.3,3,12,3S9.5,3.2,8.4,3.5C8.3,3.2,8.2,2.9,8.1,2.6C6.6,2.8,5.1,3.1,3.7,3.7C2.4,6.3,1.8,9.2,2,12.1C3.4,13.6,5.2,14.6,7,15.2C7.2,14.7,7.4,14.2,7.6,13.7C7.1,13.5,6.6,13.2,6.2,12.9C6.3,12.8,6.4,12.7,6.5,12.6C10.2,14.2,13.8,14.2,17.5,12.6C17.6,12.7,17.7,12.8,17.8,12.9C17.4,13.2,16.9,13.5,16.4,13.7C16.6,14.2,16.8,14.7,17,15.2C18.8,14.6,20.6,13.6,22,12.1C22.2,9.2,21.6,6.3,20.3,3.7M8.6,10.7C7.9,10.7,7.3,10.1,7.3,9.4C7.3,8.7,7.9,8.1,8.6,8.1S9.9,8.7,9.9,9.4C9.9,10.1,9.3,10.7,8.6,10.7M15.4,10.7C14.7,10.7,14.1,10.1,14.1,9.4C14.1,8.7,14.7,8.1,15.4,8.1S16.7,8.7,16.7,9.4C16.7,10.1,16.1,10.7,15.4,10.7Z"></path></svg>;


const LandingPage: React.FC<LandingPageProps> = ({ onEnterPlatform }) => {
  const featuresSectionRef = useRef<HTMLElement>(null);

  const handleScrollToFeatures = () => {
    featuresSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="relative overflow-x-hidden bg-brand-bg">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <ShootingStars />
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
      
      <div className="container mx-auto px-4 relative z-10">
        <header className="py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-full"></div>
            <h1 className="text-xl font-bold tracking-wider">Liveops UNITY</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#" className="text-brand-text-dark hover:text-brand-text-light">Features</a>
            <a href="#" className="text-brand-text-dark hover:text-brand-text-light">Expertise</a>
            <a href="#" className="text-brand-text-dark hover:text-brand-text-light">Industries</a>
            <a href="#" className="text-brand-text-dark hover:text-brand-text-light">Demo</a>
          </nav>
          <Button onClick={onEnterPlatform}>Access Platform</Button>
        </header>

        <main>
          {/* Hero Section */}
          <section className="py-20 md:py-32 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white">
                The AI Agent HUB
              </h1>
              <p className="mt-6 text-lg text-brand-text-dark max-w-2xl mx-auto">
                From Labs to Launch: Instantly deploy hyper-personalized, expert voice agents managed by the trusted Liveops Governance Hub.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button onClick={onEnterPlatform} size="lg">
                  Launch Your Pilot &gt;
                </Button>
                <button onClick={handleScrollToFeatures} className="flex items-center gap-3 text-white hover:text-brand-primary-light transition-colors group">
                    <span>Explore Features</span>
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                </button>
              </div>
            </div>
            <div className="relative mt-16 h-80">
              <AgentFactoryAnimation />
            </div>
          </section>

          {/* Stats Bar */}
          <section className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <StatItem value="98%" label="First Call Resolution" />
              <StatItem value="<2 min" label="Average Handle Time" />
              <StatItem value="10x" label="Faster Deployment" />
            </div>
          </section>

          {/* Features Section */}
          <section ref={featuresSectionRef} className="py-20">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-block px-3 py-1 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-full">Features</div>
                <h2 className="text-4xl font-bold text-white">Build, Deploy, and Govern at Scale</h2>
                <p className="text-brand-text-dark">
                  Our 3-step value chain for building and deploying your agentic workforce: Generation, Orchestration, and Performance.
                </p>
                <div className="space-y-6">
                  <FeatureItem icon={<CheckCircleIcon />} title="Expert Generation">
                    Create agents from scratch or integrate external platforms (Kore.ai, ElevenLabs) using our Hybrid Deployment Model.
                  </FeatureItem>
                  <FeatureItem icon={<ZapIcon />} title="Workflow Intelligence">
                    Agents execute complex, multi-step tasks (APIs, CRM updates) using the Agent Swarm model for ultimate speed.
                  </FeatureItem>
                  <FeatureItem icon={<BarChartIcon />} title="Performance & Governance">
                     Real-time visibility into FCR, Escalation, and ROI, plus immutable audit logs for full compliance tracking.
                  </FeatureItem>
                </div>
              </div>
              <CustomerInteractionAnimation />
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="py-20">
              <div className="max-w-3xl mx-auto text-center">
                  <div className="p-8 rounded-2xl border border-brand-border bg-gradient-to-br from-brand-bg-light to-brand-bg">
                      <img src={`https://i.pravatar.cc/150?u=williams`} alt="Williams Robert" className="w-16 h-16 rounded-full mx-auto -mt-16 border-4 border-brand-bg-light" />
                      <blockquote className="text-xl text-white mt-6">
                          "UNITY makes it easy to build, deploy, and manage our AI agents. We finally feel in control of our assets, and the experience keeps getting better."
                      </blockquote>
                      <footer className="mt-6">
                          <p className="font-semibold text-white">Williams Robert</p>
                          <p className="text-sm text-brand-text-dark">Head of Operations, Acme Corp</p>
                      </footer>
                  </div>
              </div>
          </section>
          
          {/* FAQ Section */}
          <section className="py-20 max-w-3xl mx-auto">
             <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>
             <div className="mt-8">
                <FAQItem question="What is an AI Agent?" defaultOpen>
                    An AI Agent is an advanced, autonomous system designed to understand, process, and respond to human conversation, particularly in voice channels. Unlike simple chatbots, they can execute complex multi-step tasks, access external systems, and personalize interactions in real-time.
                </FAQItem>
                <FAQItem question="How is UNITY different from other platforms?">
                    UNITY focuses on three core pillars: Expert Generation (creating specialized agents), Workflow Intelligence (enabling complex task execution), and robust Governance (providing complete visibility and control). Our hybrid model also allows you to integrate with existing platforms you already use.
                </FAQItem>
                 <FAQItem question="What kind of ROI can I expect?">
                    ROI varies by use case, but our clients typically see significant savings through reduced Average Handle Time (AHT), improved First Call Resolution (FCR), and lower human agent escalation rates. The platform provides real-time ROI tracking for each project.
                </FAQItem>
                 <FAQItem question="Is it secure?">
                    Absolutely. Security and compliance are built-in. We provide an immutable audit log for every agent decision, and our QA Simulation feature allows you to de-risk deployments by testing agents against historical data before they interact with a single customer.
                </FAQItem>
             </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 text-center">
            <h2 className="text-4xl font-bold text-white">Let's Build Your Agentic Workforce</h2>
            <p className="mt-4 text-brand-text-dark">Get started with a pilot project or schedule a demo with our team.</p>
            <div className="mt-8 max-w-md mx-auto flex gap-2">
                <Input type="email" placeholder="Enter your email" className="flex-1" />
                <Button>Get Started</Button>
            </div>
            <p className="text-xs text-brand-text-dark mt-3">Join our community on <a href="#" className="text-brand-accent hover:underline">Discord</a>.</p>
          </section>
        </main>
      </div>

      <VirtualAssistant />

      <footer className="border-t border-brand-border">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-4 gap-8">
                <div className="col-span-1">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-primary rounded-full"></div>
                        <h1 className="text-xl font-bold tracking-wider">Liveops UNITY</h1>
                    </div>
                    <p className="text-sm text-brand-text-dark mt-4">The world's most trusted AI Agent HUB.</p>
                     <div className="flex space-x-4 mt-4 text-brand-text-dark">
                        <a href="#" className="hover:text-white"><TwitterIcon /></a>
                        <a href="#" className="hover:text-white"><LinkedinIcon /></a>
                        <a href="#" className="hover:text-white"><DiscordIcon /></a>
                    </div>
                </div>
                 <div className="col-span-1">
                    <h4 className="font-semibold text-white">Features</h4>
                    <ul className="space-y-2 mt-4 text-sm">
                        <li><a href="#" className="text-brand-text-dark hover:text-white">Expert Generation</a></li>
                        <li><a href="#" className="text-brand-text-dark hover:text-white">Workflow Builder</a></li>
                        <li><a href="#" className="text-brand-text-dark hover:text-white">Nerve Center</a></li>
                        <li><a href="#" className="text-brand-text-dark hover:text-white">QA Simulation</a></li>
                    </ul>
                </div>
                <div className="col-span-1">
                    <h4 className="font-semibold text-white">Resources</h4>
                    <ul className="space-y-2 mt-4 text-sm">
                        <li><a href="#" className="text-brand-text-dark hover:text-white">Documentation</a></li>
                        <li><a href="#" className="text-brand-text-dark hover:text-white">API Reference</a></li>
                        <li><a href="#" className="text-brand-text-dark hover:text-white">Case Studies</a></li>
                        <li><a href="#" className="text-brand-text-dark hover:text-white">Blog</a></li>
                    </ul>
                </div>
                 <div className="col-span-1">
                    <h4 className="font-semibold text-white">Company</h4>
                    <ul className="space-y-2 mt-4 text-sm">
                        <li><a href="#" className="text-brand-text-dark hover:text-white">About Us</a></li>
                        <li><a href="#" className="text-brand-text-dark hover:text-white">Careers</a></li>
                        <li><a href="#" className="text-brand-text-dark hover:text-white">Contact</a></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-brand-border flex justify-between items-center text-sm text-brand-text-dark">
                <p>&copy; 2025 UNITY: Liveops.Agency. All rights reserved.</p>
                <div className="flex space-x-4">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms of Use</a>
                </div>
            </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;