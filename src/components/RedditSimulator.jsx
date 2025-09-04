import React, { useState } from 'react';
import { ArrowUp, ArrowDown, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { useSnippets } from '../context/SnippetContext';
import CaptureButton from './CaptureButton';

const mockRedditData = {
  post: {
    title: "What's the most useful productivity tip you've learned?",
    author: "u/ProductivityGuru",
    time: "2 hours ago",
    subreddit: "r/productivity",
    upvotes: 1247,
    comments: 89,
    content: "I've been experimenting with different productivity methods for years, and I'm curious about what specific tips or techniques have made the biggest impact on your daily workflow. Whether it's a simple habit change or a complete system overhaul, I'd love to hear what actually worked for you!"
  },
  comments: [
    {
      id: 1,
      author: "u/TimeBlocker",
      time: "1 hour ago",
      upvotes: 234,
      content: "Time blocking changed my life completely. Instead of having a vague to-do list, I assign specific time slots to each task. This prevents overestimating what I can accomplish and creates realistic expectations for my day."
    },
    {
      id: 2,
      author: "u/MinimalistMike",
      time: "45 minutes ago",
      upvotes: 156,
      content: "The 2-minute rule from David Allen's Getting Things Done. If something takes less than 2 minutes to complete, do it immediately instead of adding it to your task list. This simple principle has eliminated so much mental clutter from my daily routine."
    },
    {
      id: 3,
      author: "u/DeepWorkFan",
      time: "30 minutes ago",
      upvotes: 98,
      content: "Deep work sessions with strict no-phone policy. I put my phone in another room and work in 90-minute focused blocks. The quality of work I produce during these sessions is exponentially better than when I'm constantly switching between tasks and notifications."
    }
  ]
};

function RedditSimulator() {
  const [selectedText, setSelectedText] = useState('');
  const [selectionData, setSelectionData] = useState(null);
  const { addSnippet } = useSnippets();

  const handleTextSelection = (event) => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      setSelectionData({
        text,
        rect,
        element: event.target,
        threadUrl: 'https://reddit.com/r/productivity/comments/abc123/whats_the_most_useful_productivity_tip',
        commentUrl: event.target.dataset.commentUrl || null
      });
    } else {
      setSelectedText('');
      setSelectionData(null);
    }
  };

  const handleCapture = () => {
    if (selectedText && selectionData) {
      const snippet = {
        textContent: selectedText,
        redditUrl: 'https://reddit.com',
        threadUrl: selectionData.threadUrl,
        commentUrl: selectionData.commentUrl,
        context: {
          subreddit: 'r/productivity',
          author: selectionData.element.dataset.author || 'u/ProductivityGuru',
          title: mockRedditData.post.title
        }
      };
      
      addSnippet(snippet);
      setSelectedText('');
      setSelectionData(null);
      window.getSelection().removeAllRanges();
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white overflow-auto">
      {/* Reddit Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-orange-400 text-lg font-semibold">
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
              r
            </div>
            reddit
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4" onMouseUp={handleTextSelection}>
        {/* Post */}
        <div className="bg-gray-800 rounded-lg p-6 mb-4">
          <div className="flex gap-4">
            {/* Voting */}
            <div className="flex flex-col items-center gap-1">
              <button className="p-1 hover:bg-gray-700 rounded">
                <ArrowUp className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold">{mockRedditData.post.upvotes}</span>
              <button className="p-1 hover:bg-gray-700 rounded">
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <span className="text-blue-400">{mockRedditData.post.subreddit}</span>
                <span>•</span>
                <span>Posted by {mockRedditData.post.author}</span>
                <span>{mockRedditData.post.time}</span>
              </div>
              
              <h1 className="text-xl font-semibold mb-4" data-author={mockRedditData.post.author}>
                {mockRedditData.post.title}
              </h1>
              
              <p className="text-gray-300 mb-4 leading-relaxed" data-author={mockRedditData.post.author}>
                {mockRedditData.post.content}
              </p>

              {/* Post Actions */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <button className="flex items-center gap-1 hover:text-white">
                  <MessageCircle className="w-4 h-4" />
                  {mockRedditData.post.comments} Comments
                </button>
                <button className="flex items-center gap-1 hover:text-white">
                  <Share className="w-4 h-4" />
                  Share
                </button>
                <button className="flex items-center gap-1 hover:text-white">
                  <Bookmark className="w-4 h-4" />
                  Save
                </button>
                <button className="p-1 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          {mockRedditData.comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex gap-4">
                {/* Voting */}
                <div className="flex flex-col items-center gap-1">
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold">{comment.upvotes}</span>
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Comment Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <span className="text-blue-400">{comment.author}</span>
                    <span>{comment.time}</span>
                  </div>
                  
                  <p 
                    className="text-gray-300 leading-relaxed"
                    data-author={comment.author}
                    data-comment-url={`${mockRedditData.post.subreddit}/comments/abc123/comment_${comment.id}`}
                  >
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capture Button */}
      {selectedText && (
        <CaptureButton
          onCapture={handleCapture}
          selectedText={selectedText}
          position={selectionData?.rect}
        />
      )}
    </div>
  );
}

export default RedditSimulator;