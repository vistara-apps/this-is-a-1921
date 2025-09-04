import React, { useState } from 'react';
import { Download, Trash2, ExternalLink, Crown, Filter, Search, FileText, Share2, Brain } from 'lucide-react';
import { useSnippets } from '../context/SnippetContext';
import SnippetCard from './SnippetCard';
import ExportButton from './ExportButton';
import { ExportService } from '../services/exportService';
import { OpenAIAPI } from '../services/api';
import toast from 'react-hot-toast';

function SnippetsDashboard() {
  const { snippets, removeSnippet, user, upgradeSubscription } = useSnippets();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState('');

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.textContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.context?.subreddit?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    // Add more filter options here
    return matchesSearch;
  });

  const exportSnippets = () => {
    ExportService.exportMarkdown(filteredSnippets, {
      includeMetadata: true,
      groupBySubreddit: false,
      includeTimestamps: true
    });
    toast.success('Markdown export downloaded!');
  };

  const exportPDF = () => {
    if (user.subscriptionStatus !== 'pro') {
      toast.error('PDF export is a Pro feature. Upgrade to unlock!');
      return;
    }
    ExportService.exportPDF(filteredSnippets, {
      includeMetadata: true,
      groupBySubreddit: false,
      includeTimestamps: true
    });
    toast.success('PDF export downloaded!');
  };

  const exportJSON = () => {
    if (user.subscriptionStatus !== 'pro') {
      toast.error('JSON export is a Pro feature. Upgrade to unlock!');
      return;
    }
    ExportService.exportJSON(filteredSnippets);
    toast.success('JSON export downloaded!');
  };

  const exportCSV = () => {
    if (user.subscriptionStatus !== 'pro') {
      toast.error('CSV export is a Pro feature. Upgrade to unlock!');
      return;
    }
    ExportService.exportCSV(filteredSnippets);
    toast.success('CSV export downloaded!');
  };

  const createShareableLink = async () => {
    try {
      const shareData = await ExportService.createShareableLink(filteredSnippets);
      navigator.clipboard.writeText(shareData.shareUrl);
      toast.success('Shareable link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create shareable link');
    }
  };

  const generateAISummary = async () => {
    if (user.subscriptionStatus !== 'pro') {
      toast.error('AI summarization is a Pro feature. Upgrade to unlock!');
      return;
    }

    if (filteredSnippets.length === 0) {
      toast.error('No snippets to summarize');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const summaryText = await OpenAIAPI.summarizeSnippets(filteredSnippets);
      setSummary(summaryText);
      toast.success('AI summary generated!');
    } catch (error) {
      toast.error('Failed to generate summary. Please check your OpenAI API key.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const generateMarkdown = (snippets) => {
    let markdown = '# Reddit Snippets\n\n';
    markdown += `Generated on ${new Date().toLocaleDateString()}\n\n`;
    
    snippets.forEach((snippet, index) => {
      markdown += `## Snippet ${index + 1}\n\n`;
      markdown += `**Source:** ${snippet.context?.subreddit || 'Unknown'}\n`;
      markdown += `**Author:** ${snippet.context?.author || 'Unknown'}\n`;
      markdown += `**Date:** ${new Date(snippet.timestamp).toLocaleDateString()}\n\n`;
      markdown += `> ${snippet.textContent}\n\n`;
      markdown += `[View Source](${snippet.threadUrl})\n\n`;
      markdown += '---\n\n';
    });
    
    return markdown;
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 mb-2">My Snippets</h1>
              <p className="text-gray-600">
                {snippets.length} captured snippets • {user.subscriptionStatus === 'pro' ? 'Pro' : 'Free'} plan
              </p>
            </div>
            
            {user.subscriptionStatus !== 'pro' && (
              <button
                onClick={upgradeSubscription}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Pro
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search snippets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Snippets</option>
              <option value="recent">Recent</option>
              <option value="popular">Most Upvoted</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3">
            <ExportButton
              variant="primary"
              onClick={exportSnippets}
              icon={Download}
              disabled={snippets.length === 0}
            >
              Export as Markdown
            </ExportButton>
            
            <ExportButton
              variant="secondary"
              onClick={exportPDF}
              icon={Download}
              disabled={snippets.length === 0}
              requiresPro={user.subscriptionStatus !== 'pro'}
            >
              Export as PDF {user.subscriptionStatus !== 'pro' && '(Pro)'}
            </ExportButton>

            <ExportButton
              variant="secondary"
              onClick={exportJSON}
              icon={FileText}
              disabled={snippets.length === 0}
              requiresPro={user.subscriptionStatus !== 'pro'}
            >
              Export as JSON {user.subscriptionStatus !== 'pro' && '(Pro)'}
            </ExportButton>

            <ExportButton
              variant="secondary"
              onClick={exportCSV}
              icon={FileText}
              disabled={snippets.length === 0}
              requiresPro={user.subscriptionStatus !== 'pro'}
            >
              Export as CSV {user.subscriptionStatus !== 'pro' && '(Pro)'}
            </ExportButton>

            <ExportButton
              variant="secondary"
              onClick={createShareableLink}
              icon={Share2}
              disabled={snippets.length === 0}
            >
              Create Shareable Link
            </ExportButton>

            <ExportButton
              variant="secondary"
              onClick={generateAISummary}
              icon={Brain}
              disabled={snippets.length === 0 || isGeneratingSummary}
              requiresPro={user.subscriptionStatus !== 'pro'}
            >
              {isGeneratingSummary ? 'Generating...' : 'AI Summary'} {user.subscriptionStatus !== 'pro' && '(Pro)'}
            </ExportButton>
          </div>
        </div>

        {/* AI Summary */}
        {summary && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">AI Summary</h3>
            </div>
            <div className="prose prose-blue max-w-none">
              <p className="text-blue-800 whitespace-pre-wrap">{summary}</p>
            </div>
            <button
              onClick={() => setSummary('')}
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Hide Summary
            </button>
          </div>
        )}

        {/* Snippets Grid */}
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {snippets.length === 0 ? 'No snippets yet' : 'No snippets match your search'}
            </h3>
            <p className="text-gray-600">
              {snippets.length === 0 
                ? 'Start capturing insights from Reddit to see them here.' 
                : 'Try adjusting your search terms or filters.'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onDelete={() => removeSnippet(snippet.id)}
                variant="default"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SnippetsDashboard;
