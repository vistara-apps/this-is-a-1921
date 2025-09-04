import React, { createContext, useContext, useReducer, useEffect } from 'react';

const SnippetContext = createContext();

const initialState = {
  snippets: [],
  user: {
    userId: 'user_123',
    email: 'demo@example.com',
    subscriptionStatus: 'free',
    createdAt: new Date().toISOString()
  }
};

function snippetReducer(state, action) {
  switch (action.type) {
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
        snippets: action.payload
      };
    case 'UPGRADE_SUBSCRIPTION':
      return {
        ...state,
        user: {
          ...state.user,
          subscriptionStatus: 'pro'
        }
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

  return (
    <SnippetContext.Provider value={{
      ...state,
      addSnippet,
      removeSnippet,
      upgradeSubscription
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