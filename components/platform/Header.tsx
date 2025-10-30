import React, { useState, useRef, useEffect } from 'react';
import { Project, View } from '../../types';

interface HeaderProps {
    project: Project | undefined;
    view: View;
    projects: Project[];
    onSelectProject: (projectId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ project, view, projects, onSelectProject }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getTitle = () => {
        if (view === 'dashboard') {
            return 'Global Nerve Center';
        }
        if (view === 'workflow-builder') {
          return `Workflow Builder`;
        }
        if (view === 'create-agent') {
            return `Create New Agent`;
        }
         if (view === 'edit-agent') {
            return `Edit Agent`;
        }
        if (view === 'tasks') {
            return 'Task Management';
        }
        if (view === 'api-tools') {
            return 'API Tool Management';
        }
        return 'Project Agents';
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);


  return (
    <header className="flex-shrink-0 bg-brand-bg border-b border-brand-border px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-brand-text-light">{getTitle()}</h2>
        {project && view !== 'dashboard' && view !== 'tasks' && view !== 'api-tools' && (
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-sm text-brand-text-dark hover:text-brand-text-light bg-brand-bg-light/50 border border-transparent hover:border-brand-border px-3 py-1 rounded-full transition-colors"
                >
                    <span>{project.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {isDropdownOpen && (
                    <div className="absolute top-full mt-2 w-64 bg-brand-bg-light border border-brand-border rounded-lg shadow-xl z-10">
                        <div className="p-2">
                            {projects.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => { onSelectProject(p.id); setIsDropdownOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${p.id === project.id ? 'bg-brand-primary text-white' : 'hover:bg-brand-bg'}`}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-brand-text-dark hover:text-brand-text-light">
            <BellIcon />
        </button>
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
                A
            </div>
            <span className="text-sm font-medium text-brand-text-light">Acme Corp</span>
        </div>
      </div>
    </header>
  );
};

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;

export default Header;