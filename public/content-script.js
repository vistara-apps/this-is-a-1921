// Reddit Snippetter Content Script
// This script runs on Reddit pages to enable text selection and snippet capture

(function() {
  'use strict';

  let selectedText = '';
  let selectionData = null;
  let captureButton = null;

  // Initialize the content script
  function init() {
    console.log('Reddit Snippetter: Content script loaded');
    
    // Add event listeners for text selection
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);
    
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Add custom styles
    addCustomStyles();
  }

  // Handle text selection
  function handleTextSelection(event) {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && text.length > 10) { // Only show button for meaningful selections
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      selectedText = text;
      selectionData = {
        text,
        rect,
        element: event.target,
        threadUrl: window.location.href,
        commentUrl: getCommentUrl(event.target)
      };
      
      showCaptureButton(rect);
    } else {
      hideCaptureButton();
      selectedText = '';
      selectionData = null;
    }
  }

  // Get comment URL if the selection is within a comment
  function getCommentUrl(element) {
    const commentElement = element.closest('[data-testid="comment"]') || 
                          element.closest('.Comment') ||
                          element.closest('[class*="comment"]');
    
    if (commentElement) {
      const permalink = commentElement.querySelector('a[href*="/comments/"]');
      if (permalink) {
        return new URL(permalink.href, window.location.origin).href;
      }
    }
    
    return null;
  }

  // Show the capture button
  function showCaptureButton(rect) {
    hideCaptureButton(); // Remove existing button
    
    captureButton = document.createElement('div');
    captureButton.id = 'reddit-snippetter-capture-btn';
    captureButton.innerHTML = `
      <button class="capture-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17,21 17,13 7,13 7,21"/>
          <polyline points="7,3 7,8 15,8"/>
        </svg>
        Capture
      </button>
    `;
    
    // Position the button
    captureButton.style.position = 'fixed';
    captureButton.style.left = `${rect.left + window.scrollX}px`;
    captureButton.style.top = `${rect.bottom + window.scrollY + 5}px`;
    captureButton.style.zIndex = '10000';
    
    // Add click handler
    captureButton.querySelector('.capture-btn').addEventListener('click', handleCapture);
    
    document.body.appendChild(captureButton);
  }

  // Hide the capture button
  function hideCaptureButton() {
    if (captureButton) {
      captureButton.remove();
      captureButton = null;
    }
  }

  // Handle snippet capture
  function handleCapture() {
    if (!selectedText || !selectionData) return;
    
    const snippet = {
      textContent: selectedText,
      redditUrl: 'https://reddit.com',
      threadUrl: selectionData.threadUrl,
      commentUrl: selectionData.commentUrl,
      context: {
        subreddit: getSubreddit(),
        author: getAuthor(selectionData.element),
        title: getPostTitle()
      },
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    // Save to Chrome storage
    chrome.storage.local.get(['reddit-snippets'], (result) => {
      const snippets = result['reddit-snippets'] || [];
      snippets.push(snippet);
      
      chrome.storage.local.set({ 'reddit-snippets': snippets }, () => {
        console.log('Snippet saved:', snippet);
        showNotification('Snippet captured successfully!');
        
        // Clear selection and hide button
        window.getSelection().removeAllRanges();
        hideCaptureButton();
        selectedText = '';
        selectionData = null;
      });
    });
  }

  // Get current subreddit
  function getSubreddit() {
    const match = window.location.pathname.match(/\/r\/([^\/]+)/);
    return match ? `r/${match[1]}` : 'Unknown';
  }

  // Get author from element context
  function getAuthor(element) {
    const authorElement = element.closest('[data-testid="comment"]')?.querySelector('[data-testid="comment_author_link"]') ||
                         element.closest('.Comment')?.querySelector('.Comment__author') ||
                         document.querySelector('[data-testid="post-content"]')?.querySelector('[data-click-id="user"]');
    
    return authorElement?.textContent?.trim() || 'Unknown';
  }

  // Get post title
  function getPostTitle() {
    const titleElement = document.querySelector('[data-testid="post-content"] h1') ||
                        document.querySelector('.Post__title') ||
                        document.querySelector('h1');
    
    return titleElement?.textContent?.trim() || 'Unknown Post';
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.id = 'reddit-snippetter-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Handle messages from popup
  function handleMessage(request, sender, sendResponse) {
    if (request.action === 'getSelectedText') {
      sendResponse({ text: selectedText, data: selectionData });
    } else if (request.action === 'captureSnippet') {
      handleCapture();
      sendResponse({ success: true });
    }
  }

  // Add custom styles
  function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #reddit-snippetter-capture-btn .capture-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
      }
      
      #reddit-snippetter-capture-btn .capture-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
