import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { SyncAPI } from '../services/api';

const SnippetContext = createContext();

const initialState = {
  snippets: [],
  user: {
    userId: 'user_123',
    email: 'demo@example.com',
    subscriptionStatus: 'free',
    createdAt: new Date().toISOString(),
    isAuthenticated: false
  },
  isLoading: false,
  error: null
};

function snippetReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'SET_USER':
      return {
        ...state,
        user: {
          ...action.payload,
          isAuthenticated: true
        },
        error: null
      };
    case 'LOGOUT':
      return {
        ...state,
        user: {
          ...initialState.user
        },
        snippets: []
      };
    case 'ADD_SNIPPET':
      return {
        ...state,
        snippets: [...state.snippets, action.payload]
      };
    case 'REMOVE_SNIPPET':
      return {
        ...state,
        snippets: state.snippets.filter(snippet => snippet.id !== action.payload)
      };
    case 'LOAD_SNIPPETS':
      return {
        ...state,
        snippets: action.payload,
        isLoading: false
      };
    case 'CLEAR_SNIPPETS':
      return {
        ...state,
        snippets: []
      };
    case 'UPDATE_SNIPPET':
      return {
        ...state,
        snippets: state.snippets.map(snippet =>
          snippet.id === action.payload.id
            ? { ...snippet, ...action.payload.updates }
            : snippet
        )
      };
    case 'UPGRADE_SUBSCRIPTION':
      return {
        ...state,
        user: {
          ...state.user,
          subscriptionStatus: 'pro'
        }
      };
    case 'ADD_SNIPPET_CATEGORY':
      return {
        ...state,
        snippets: state.snippets.map(snippet =>
          snippet.id === action.payload.id
            ? { ...snippet, category: action.payload.category }
            : snippet
        )
      };
    default:
      return state;
  }
}

export function SnippetProvider({ children }) {
  const [state, dispatch] = useReducer(snippetReducer, initialState);

  // Load snippets from localStorage on mount
  useEffect(() => {
    const savedSnippets = localStorage.getItem('reddit-snippets');
    if (savedSnippets) {
      dispatch({ type: 'LOAD_SNIPPETS', payload: JSON.parse(savedSnippets) });
    }
  }, []);

  // Save snippets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reddit-snippets', JSON.stringify(state.snippets));
  }, [state.snippets]);

  const addSnippet = (snippet) => {
    const newSnippet = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: state.user.userId,
      ...snippet
    };
    dispatch({ type: 'ADD_SNIPPET', payload: newSnippet });
  };

  const removeSnippet = (id) => {
    dispatch({ type: 'REMOVE_SNIPPET', payload: id });
  };

  const upgradeSubscription = () => {
    dispatch({ type: 'UPGRADE_SUBSCRIPTION' });
  };

  const setUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: userData });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('reddit-snippets');
    localStorage.removeItem('user-data');
  };

  const clearAllSnippets = () => {
    dispatch({ type: 'CLEAR_SNIPPETS' });
  };

  const updateSnippet = (id, updates) => {
    dispatch({ type: 'UPDATE_SNIPPET', payload: { id, updates } });
  };

  const addSnippetCategory = (id, category) => {
    dispatch({ type: 'ADD_SNIPPET_CATEGORY', payload: { id, category } });
  };

  const syncSnippets = async () => {
    if (!state.user.isAuthenticated) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await SyncAPI.saveSnippets(state.snippets, state.user.userId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadSyncedSnippets = async () => {
    if (!state.user.isAuthenticated) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const snippets = await SyncAPI.loadSnippets(state.user.userId);
      dispatch({ type: 'LOAD_SNIPPETS', payload: snippets });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  return (
    <SnippetContext.Provider value={{
      ...state,
      addSnippet,
      removeSnippet,
      updateSnippet,
      clearAllSnippets,
      upgradeSubscription,
      setUser,
      logout,
      addSnippetCategory,
      syncSnippets,
      loadSyncedSnippets
    }}>
      {children}
    </SnippetContext.Provider>
  );
}

export function useSnippets() {
  const context = useContext(SnippetContext);
  if (!context) {
    throw new Error('useSnippets must be used within a SnippetProvider');
  }
  return context;
}
