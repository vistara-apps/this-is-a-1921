import React, { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import RedditSimulator from './components/RedditSimulator';
import SnippetsDashboard from './components/SnippetsDashboard';
import { SnippetProvider } from './context/SnippetContext';

function App() {
  const [currentView, setCurrentView] = useState('simulator');

  return (
    <SnippetProvider>
      <div className="min-h-screen gradient-bg">
        <AppShell currentView={currentView} onViewChange={setCurrentView}>
          {currentView === 'simulator' && <RedditSimulator />}
          {currentView === 'dashboard' && <SnippetsDashboard />}
        </AppShell>
      </div>
    </SnippetProvider>
  );
}

export default App;