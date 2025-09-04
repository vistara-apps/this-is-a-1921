import React from 'react';
import { Plus, Zap } from 'lucide-react';

function CaptureButton({ onCapture, selectedText, position }) {
  if (!position) return null;

  const style = {
    position: 'fixed',
    top: position.top - 50,
    left: position.left + position.width / 2 - 75,
    zIndex: 1000,
  };

  return (
    <div style={style} className="animate-fade-in">
      <button
        onClick={onCapture}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
      >
        <Zap className="w-4 h-4" />
        Capture Snippet
      </button>
      
      {/* Preview */}
      <div className="mt-2 bg-gray-800 text-white p-2 rounded-lg shadow-lg max-w-xs">
        <div className="text-xs text-gray-400 mb-1">Selected text:</div>
        <div className="text-sm truncate">
          {selectedText.length > 50 ? `${selectedText.substring(0, 50)}...` : selectedText}
        </div>
      </div>
    </div>
  );
}

export default CaptureButton;