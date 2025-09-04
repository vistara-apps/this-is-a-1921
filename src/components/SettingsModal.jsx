import React, { useState } from 'react';
import { X, Crown, Check, Settings, User, Bell, Download, Trash2, Shield } from 'lucide-react';
import { useSnippets } from '../context/SnippetContext';
import { AuthAPI } from '../services/api';
import toast from 'react-hot-toast';

function SettingsModal({ isOpen, onClose }) {
  const { user, upgradeSubscription, snippets, clearAllSnippets } = useSnippets();
  const [activeTab, setActiveTab] = useState('account');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    includeMetadata: true,
    groupBySubreddit: false,
    includeTimestamps: true
  });

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await AuthAPI.upgradeSubscription(user.userId);
      upgradeSubscription();
      toast.success('Successfully upgraded to Pro! 🎉');
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete all your snippets? This action cannot be undone.')) {
      clearAllSnippets();
      toast.success('All snippets have been deleted');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'export', label: 'Export Settings', icon: Download },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User ID</label>
                      <p className="text-gray-600 font-mono text-sm">{user.userId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member Since</label>
                      <p className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{snippets.length}</div>
                      <div className="text-sm text-blue-700">Total Snippets</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {snippets.filter(s => new Date(s.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                      </div>
                      <div className="text-sm text-green-700">This Week</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
                  <div className={`rounded-lg p-6 border-2 ${
                    user.subscriptionStatus === 'pro' 
                      ? 'border-yellow-300 bg-yellow-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.subscriptionStatus === 'pro' && (
                          <Crown className="w-6 h-6 text-yellow-600" />
                        )}
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">
                            {user.subscriptionStatus === 'pro' ? 'Pro Plan' : 'Free Plan'}
                          </h4>
                          <p className="text-gray-600">
                            {user.subscriptionStatus === 'pro' 
                              ? '$5/month - All features unlocked' 
                              : 'Limited features'
                            }
                          </p>
                        </div>
                      </div>
                      {user.subscriptionStatus !== 'pro' && (
                        <button
                          onClick={handleUpgrade}
                          disabled={isUpgrading}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Crown className="w-4 h-4" />
                          {isUpgrading ? 'Upgrading...' : 'Upgrade to Pro'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Comparison</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Free Plan */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Free Plan</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Unlimited snippet capture</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Markdown export</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Basic search & filtering</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-500">PDF export</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-500">AI summarization</span>
                        </div>
                      </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="border-2 border-yellow-300 rounded-lg p-6 bg-yellow-50">
                      <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-yellow-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Pro Plan</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Everything in Free</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">PDF export</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">CSV & JSON export</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">AI summarization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Cloud sync</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Priority support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Include Metadata</label>
                        <p className="text-sm text-gray-600">Add generation date and snippet count to exports</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={exportSettings.includeMetadata}
                        onChange={(e) => setExportSettings(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Group by Subreddit</label>
                        <p className="text-sm text-gray-600">Organize snippets by their source subreddit</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={exportSettings.groupBySubreddit}
                        onChange={(e) => setExportSettings(prev => ({ ...prev, groupBySubreddit: e.target.checked }))}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Include Timestamps</label>
                        <p className="text-sm text-gray-600">Show when each snippet was captured</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={exportSettings.includeTimestamps}
                        onChange={(e) => setExportSettings(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h4>
                      <p className="text-red-700 mb-4">
                        These actions are permanent and cannot be undone.
                      </p>
                      <button
                        onClick={handleClearAllData}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete All Snippets
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Information</h3>
                  <div className="prose prose-sm text-gray-600">
                    <p>
                      Reddit Snippetter respects your privacy. Here's how we handle your data:
                    </p>
                    <ul>
                      <li>Snippets are stored locally in your browser by default</li>
                      <li>Pro users can optionally sync data to our secure servers</li>
                      <li>We never share your personal data with third parties</li>
                      <li>You can export or delete your data at any time</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
