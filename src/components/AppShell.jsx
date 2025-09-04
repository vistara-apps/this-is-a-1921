import React from 'react';
import { Menu, Home, Database, Settings, Crown } from 'lucide-react';
import { useSnippets } from '../context/SnippetContext';

function AppShell({ children, currentView, onViewChange }) {
  const { user, snippets } = useSnippets();

  const menuItems = [
    { id: 'simulator', icon: Home, label: 'Reddit Simulator', description: 'Practice highlighting' },
    { id: 'dashboard', icon: Database, label: 'My Snippets', description: `${snippets.length} saved` },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 glass-effect text-white p-6 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Menu className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold">Reddit Snippetter</h1>
          </div>
          <p className="text-gray-300 text-sm">Capture, compile, and export Reddit insights effortlessly.</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* User Status */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{user.email}</div>
              <div className="flex items-center gap-1 text-xs">
                {user.subscriptionStatus === 'pro' ? (
                  <>
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400">Pro</span>
                  </>
                ) : (
                  <span className="text-gray-400">Free</span>
                )}
              </div>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default AppShell;