// Reddit Snippetter Background Service Worker

// Install event
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Reddit Snippetter installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set up default settings
    chrome.storage.local.set({
      'reddit-snippets': [],
      'user-settings': {
        autoCapture: false,
        notifications: true,
        exportFormat: 'markdown'
      }
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open the popup or main interface
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});

// Context menu for quick capture
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'capture-selection',
    title: 'Capture with Reddit Snippetter',
    contexts: ['selection'],
    documentUrlPatterns: ['https://www.reddit.com/*', 'https://reddit.com/*']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'capture-selection' && info.selectionText) {
    // Send message to content script to capture the selection
    chrome.tabs.sendMessage(tab.id, {
      action: 'captureSelection',
      text: info.selectionText,
      url: tab.url
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveSnippet') {
    saveSnippet(request.snippet, sendResponse);
    return true; // Keep message channel open for async response
  } else if (request.action === 'getSnippets') {
    getSnippets(sendResponse);
    return true;
  } else if (request.action === 'deleteSnippet') {
    deleteSnippet(request.id, sendResponse);
    return true;
  } else if (request.action === 'exportSnippets') {
    exportSnippets(request.format, sendResponse);
    return true;
  }
});

// Save snippet to storage
function saveSnippet(snippet, sendResponse) {
  chrome.storage.local.get(['reddit-snippets'], (result) => {
    const snippets = result['reddit-snippets'] || [];
    
    // Add unique ID and timestamp
    snippet.id = Date.now().toString();
    snippet.timestamp = new Date().toISOString();
    
    snippets.push(snippet);
    
    chrome.storage.local.set({ 'reddit-snippets': snippets }, () => {
      console.log('Snippet saved:', snippet);
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Reddit Snippetter',
        message: 'Snippet captured successfully!'
      });
      
      sendResponse({ success: true, snippet });
    });
  });
}

// Get all snippets
function getSnippets(sendResponse) {
  chrome.storage.local.get(['reddit-snippets'], (result) => {
    const snippets = result['reddit-snippets'] || [];
    sendResponse({ snippets });
  });
}

// Delete a snippet
function deleteSnippet(id, sendResponse) {
  chrome.storage.local.get(['reddit-snippets'], (result) => {
    const snippets = result['reddit-snippets'] || [];
    const filteredSnippets = snippets.filter(snippet => snippet.id !== id);
    
    chrome.storage.local.set({ 'reddit-snippets': filteredSnippets }, () => {
      console.log('Snippet deleted:', id);
      sendResponse({ success: true });
    });
  });
}

// Export snippets
function exportSnippets(format, sendResponse) {
  chrome.storage.local.get(['reddit-snippets'], (result) => {
    const snippets = result['reddit-snippets'] || [];
    
    let exportData;
    let filename;
    let mimeType;
    
    switch (format) {
      case 'json':
        exportData = JSON.stringify(snippets, null, 2);
        filename = 'reddit-snippets.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        exportData = convertToCSV(snippets);
        filename = 'reddit-snippets.csv';
        mimeType = 'text/csv';
        break;
      default: // markdown
        exportData = convertToMarkdown(snippets);
        filename = 'reddit-snippets.md';
        mimeType = 'text/markdown';
    }
    
    // Create download
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    }, (downloadId) => {
      URL.revokeObjectURL(url);
      sendResponse({ success: true, downloadId });
    });
  });
}

// Convert snippets to CSV format
function convertToCSV(snippets) {
  const headers = ['ID', 'Content', 'Subreddit', 'Author', 'Thread URL', 'Timestamp'];
  const rows = [headers.join(',')];
  
  snippets.forEach(snippet => {
    const row = [
      snippet.id,
      `"${snippet.textContent.replace(/"/g, '""')}"`,
      snippet.context?.subreddit || '',
      snippet.context?.author || '',
      snippet.threadUrl || '',
      snippet.timestamp
    ];
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

// Convert snippets to Markdown format
function convertToMarkdown(snippets) {
  let markdown = '# Reddit Snippets\n\n';
  markdown += `Generated on ${new Date().toLocaleDateString()}\n\n`;
  
  snippets.forEach((snippet, index) => {
    markdown += `## Snippet ${index + 1}\n\n`;
    markdown += `**Source:** ${snippet.context?.subreddit || 'Unknown'}\n`;
    markdown += `**Author:** ${snippet.context?.author || 'Unknown'}\n`;
    markdown += `**Date:** ${new Date(snippet.timestamp).toLocaleDateString()}\n\n`;
    markdown += `> ${snippet.textContent}\n\n`;
    if (snippet.threadUrl) {
      markdown += `[View Source](${snippet.threadUrl})\n\n`;
    }
    markdown += '---\n\n';
  });
  
  return markdown;
}

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes['reddit-snippets']) {
    console.log('Snippets updated:', changes['reddit-snippets'].newValue?.length || 0);
  }
});

// Periodic cleanup of old data (optional)
chrome.alarms.create('cleanup', { periodInMinutes: 60 * 24 }); // Daily

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    // Clean up old temporary data if needed
    console.log('Running periodic cleanup...');
  }
});
