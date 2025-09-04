import React from 'react';
import { ExternalLink, Trash2, Clock, User } from 'lucide-react';

function SnippetCard({ snippet, onDelete, variant = 'default' }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openSource = () => {
    window.open(snippet.threadUrl, '_blank');
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-card border border-gray-200 p-6 hover:shadow-lg transition-all duration-200
      ${variant === 'compact' ? 'p-4' : 'p-6'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
              {snippet.context?.subreddit || 'r/unknown'}
            </span>
            <Clock className="w-3 h-3" />
            <span>{formatDate(snippet.timestamp)}</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <User className="w-3 h-3" />
            <span>{snippet.context?.author || 'Unknown user'}</span>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={openSource}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View source"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete snippet"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">
          {snippet.textContent}
        </p>
      </div>

      {/* Footer */}
      {snippet.context?.title && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 font-medium truncate">
            From: {snippet.context.title}
          </p>
        </div>
      )}
    </div>
  );
}

export default SnippetCard;