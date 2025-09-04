import axios from 'axios';

// API Configuration
const API_CONFIG = {
  reddit: {
    baseURL: 'https://www.reddit.com',
    userAgent: 'RedditSnippetter/1.0.0'
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: process.env.REACT_APP_OPENAI_API_KEY
  }
};

// Reddit API Service
export class RedditAPI {
  static async getPostData(postUrl) {
    try {
      // Extract post ID from URL
      const postId = this.extractPostId(postUrl);
      if (!postId) throw new Error('Invalid Reddit URL');

      // Use Reddit's JSON API
      const response = await axios.get(`${API_CONFIG.reddit.baseURL}${postId}.json`, {
        headers: {
          'User-Agent': API_CONFIG.reddit.userAgent
        }
      });

      const postData = response.data[0]?.data?.children[0]?.data;
      const comments = response.data[1]?.data?.children || [];

      return {
        post: {
          id: postData?.id,
          title: postData?.title,
          author: postData?.author,
          subreddit: postData?.subreddit_name_prefixed,
          url: postData?.url,
          permalink: postData?.permalink,
          created_utc: postData?.created_utc,
          score: postData?.score,
          num_comments: postData?.num_comments,
          selftext: postData?.selftext
        },
        comments: comments.map(comment => ({
          id: comment.data?.id,
          author: comment.data?.author,
          body: comment.data?.body,
          score: comment.data?.score,
          created_utc: comment.data?.created_utc,
          permalink: comment.data?.permalink
        }))
      };
    } catch (error) {
      console.error('Reddit API Error:', error);
      throw new Error('Failed to fetch Reddit data');
    }
  }

  static extractPostId(url) {
    // Extract post ID from various Reddit URL formats
    const patterns = [
      /reddit\.com\/r\/\w+\/comments\/(\w+)/,
      /redd\.it\/(\w+)/,
      /reddit\.com\/(\w+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `/r/${match[1]}`;
    }
    return null;
  }

  static async searchSubreddit(subreddit, query, limit = 25) {
    try {
      const response = await axios.get(
        `${API_CONFIG.reddit.baseURL}/r/${subreddit}/search.json`,
        {
          params: {
            q: query,
            restrict_sr: 'on',
            sort: 'relevance',
            limit
          },
          headers: {
            'User-Agent': API_CONFIG.reddit.userAgent
          }
        }
      );

      return response.data.data.children.map(post => ({
        id: post.data.id,
        title: post.data.title,
        author: post.data.author,
        subreddit: post.data.subreddit_name_prefixed,
        url: post.data.url,
        permalink: post.data.permalink,
        score: post.data.score,
        created_utc: post.data.created_utc
      }));
    } catch (error) {
      console.error('Reddit Search Error:', error);
      throw new Error('Failed to search Reddit');
    }
  }
}

// OpenAI API Service
export class OpenAIAPI {
  static async summarizeSnippets(snippets) {
    if (!API_CONFIG.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const snippetTexts = snippets.map(s => s.textContent).join('\n\n');
      
      const response = await axios.post(
        `${API_CONFIG.openai.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes Reddit discussions and extracts key insights.'
            },
            {
              role: 'user',
              content: `Please provide a concise summary of these Reddit snippets and extract the key insights:\n\n${snippetTexts}`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate summary');
    }
  }

  static async categorizeSnippets(snippets) {
    if (!API_CONFIG.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const snippetTexts = snippets.map((s, i) => `${i + 1}. ${s.textContent}`).join('\n');
      
      const response = await axios.post(
        `${API_CONFIG.openai.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that categorizes text snippets into relevant topics. Return a JSON array where each item has "index" (1-based) and "category" fields.'
            },
            {
              role: 'user',
              content: `Please categorize these snippets into relevant topics:\n\n${snippetTexts}`
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const categories = JSON.parse(response.data.choices[0].message.content);
      return categories;
    } catch (error) {
      console.error('OpenAI Categorization Error:', error);
      throw new Error('Failed to categorize snippets');
    }
  }
}

// User Authentication Service (Mock implementation)
export class AuthAPI {
  static async login(email, password) {
    // Mock authentication - in real app, this would call your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          userId: 'user_' + Date.now(),
          email,
          subscriptionStatus: 'free',
          createdAt: new Date().toISOString(),
          token: 'mock_jwt_token'
        });
      }, 1000);
    });
  }

  static async register(email, password) {
    // Mock registration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          userId: 'user_' + Date.now(),
          email,
          subscriptionStatus: 'free',
          createdAt: new Date().toISOString(),
          token: 'mock_jwt_token'
        });
      }, 1000);
    });
  }

  static async upgradeSubscription(userId) {
    // Mock subscription upgrade
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          subscriptionStatus: 'pro',
          upgradeDate: new Date().toISOString()
        });
      }, 1000);
    });
  }
}

// Export service for snippet synchronization
export class SyncAPI {
  static async saveSnippets(snippets, userId) {
    // Mock cloud sync - in real app, this would sync to your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(`reddit-snippets-${userId}`, JSON.stringify(snippets));
        resolve({ success: true, synced: snippets.length });
      }, 500);
    });
  }

  static async loadSnippets(userId) {
    // Mock cloud sync load
    return new Promise((resolve) => {
      setTimeout(() => {
        const snippets = JSON.parse(localStorage.getItem(`reddit-snippets-${userId}`) || '[]');
        resolve(snippets);
      }, 500);
    });
  }
}
