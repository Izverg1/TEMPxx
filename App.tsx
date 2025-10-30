import React, { useState, useCallback } from 'react';
import LandingPage from './views/LandingPage';
import Platform from './views/Platform';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'platform'>('landing');

  const handleEnterPlatform = useCallback(() => {
    setView('platform');
  }, []);
  
  const handleExitPlatform = useCallback(() => {
    setView('landing');
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      {view === 'landing' ? (
        <LandingPage onEnterPlatform={handleEnterPlatform} />
      ) : (
        <Platform onExitPlatform={handleExitPlatform} />
      )}
    </div>
  );
};

export default App;