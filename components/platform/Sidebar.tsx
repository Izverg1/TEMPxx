import React from 'react';
import { View } from '../../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onExit: () => void;
}

const NavItem: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors relative ${
      isActive
        ? 'bg-brand-primary/10 text-brand-primary font-semibold'
        : 'text-brand-text-dark hover:bg-brand-bg-light hover:text-brand-text-light'
    }`}
  >
    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-brand-primary rounded-r-full"></div>}
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onExit }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-brand-bg border-r border-brand-border p-4">
      <div className="flex items-center mb-8 h-16 px-2">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L2 9L12 15L22 9L12 3Z" /><path d="M2 15L12 21L22 15" /><path d="M2 9L12 15L22 9" /></svg>
            </div>
            <h1 className="text-2xl font-bold tracking-wider">UNITY</h1>
          </div>
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem 
          label="Nerve Center" 
          isActive={currentView === 'dashboard'} 
          onClick={() => setView('dashboard')}
          icon={<HomeIcon />}
        />
        <NavItem 
          label="Project Agents" 
          isActive={currentView === 'project-agents' || currentView === 'create-agent' || currentView === 'edit-agent'} 
          onClick={() => setView('project-agents')}
          icon={<UsersIcon />}
        />
        <NavItem 
          label="Workflow Builder" 
          isActive={currentView === 'workflow-builder'} 
          onClick={() => setView('workflow-builder')}
          icon={<WorkflowIcon />}
        />
        <NavItem 
          label="API Tools" 
          isActive={currentView === 'api-tools'} 
          onClick={() => setView('api-tools')}
          icon={<CodeIcon />}
        />
        <NavItem 
          label="Tasks" 
          isActive={currentView === 'tasks'} 
          onClick={() => setView('tasks')}
          icon={<TasksIcon />}
        />
      </nav>
      <div className="mt-auto space-y-4">
         <div className="text-xs text-brand-text-dark px-4">Ref Arch. v13.0</div>
         <button
            onClick={onExit}
            className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-brand-text-dark hover:bg-brand-bg-light hover:text-brand-text-light"
          >
            <LogOutIcon />
            <span className="ml-3">Exit to Landing</span>
        </button>
      </div>
    </aside>
  );
};

// Icons (Updated solid style)
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>;
const WorkflowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5 7a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm6 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-3 6a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.672 7.672a.75.75 0 010 1.06l-2.47 2.47a.75.75 0 010 1.06l2.47 2.47a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0zm6.656 0a.75.75 0 000 1.06l2.47 2.47a.75.75 0 000 1.06l-2.47 2.47a.75.75 0 101.06 1.06l3-3a.75.75 0 000-1.06l-3-3a.75.75 0 00-1.06 0z" clipRule="evenodd" /></svg>;
const TasksIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;

export default Sidebar;