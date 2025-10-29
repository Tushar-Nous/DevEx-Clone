import React, { createContext, useContext, useReducer, useEffect } from 'react';

const RequirementsContext = createContext();

const initialState = {
  requirements: [],
  epics: [],
  features: [],
  userStories: [],
  prompts: [],
  currentRequirement: null,
  loading: false,
  error: null
};

const requirementsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_REQUIREMENT':
      return { 
        ...state, 
        requirements: [...state.requirements, action.payload],
        currentRequirement: action.payload
      };
    case 'SET_REQUIREMENTS':
      return { ...state, requirements: action.payload };
    case 'ADD_EPICS':
      return { ...state, epics: [...state.epics, ...action.payload] };
    case 'ADD_FEATURES':
      return { ...state, features: [...state.features, ...action.payload] };
    case 'ADD_USER_STORIES':
      return { ...state, userStories: [...state.userStories, ...action.payload] };
    case 'ADD_PROMPTS':
      return { ...state, prompts: action.payload };
    case 'SET_CURRENT_REQUIREMENT':
      return { ...state, currentRequirement: action.payload };
    case 'CLEAR_DATA':
      return { ...state, epics: [], features: [], userStories: [], prompts: [] };
    default:
      return state;
  }
};

export const RequirementsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(requirementsReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('nous-sdlc-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.requirements) {
          dispatch({ type: 'SET_REQUIREMENTS', payload: parsedData.requirements });
        }
        if (parsedData.epics) {
          dispatch({ type: 'ADD_EPICS', payload: parsedData.epics });
        }
        if (parsedData.features) {
          dispatch({ type: 'ADD_FEATURES', payload: parsedData.features });
        }
        if (parsedData.userStories) {
          dispatch({ type: 'ADD_USER_STORIES', payload: parsedData.userStories });
        }
        if (parsedData.prompts) {
          dispatch({ type: 'ADD_PROMPTS', payload: parsedData.prompts });
        }
      } catch (error) {
        // Error loading saved data - will use initial state
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      requirements: state.requirements,
      epics: state.epics,
      features: state.features,
      userStories: state.userStories,
      prompts: state.prompts
    };
    localStorage.setItem('nous-sdlc-data', JSON.stringify(dataToSave));
  }, [state.requirements, state.epics, state.features, state.userStories, state.prompts]);

  const value = {
    ...state,
    dispatch
  };

  return (
    <RequirementsContext.Provider value={value}>
      {children}
    </RequirementsContext.Provider>
  );
};

export const useRequirements = () => {
  const context = useContext(RequirementsContext);
  if (!context) {
    throw new Error('useRequirements must be used within a RequirementsProvider');
  }
  return context;
};
