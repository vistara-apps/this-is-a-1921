import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AppShell from './components/AppShell';
import RedditSimulator from './components/RedditSimulator';
import SnippetsDashboard from './components/SnippetsDashboard';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { SnippetProvider, useSnippets } from './context/SnippetContext';

function AppContent() {
  const [currentView, setCurrentView] = useState('simulator');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { user, setUser } = useSnippets();

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleViewChange = (view) => {
    if (view === 'settings') {
      setShowSettingsModal(true);
    } else if (view === 'auth') {
      setShowAuthModal(true);
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <AppShell 
        currentView={currentView} 
        onViewChange={handleViewChange}
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
      >
        {currentView === 'simulator' && <RedditSimulator />}
        {currentView === 'dashboard' && <SnippetsDashboard />}
      </AppShell>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SnippetProvider>
        <AppContent />
      </SnippetProvider>
    </ErrorBoundary>
  );
}

export default App;
