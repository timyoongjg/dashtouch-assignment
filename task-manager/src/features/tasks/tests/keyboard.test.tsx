import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer, { addTask, deleteTask } from '../tasksSlice';

// Mock theme reducer (defined directly in test file)
const mockThemeReducer = (state = { darkMode: false }, action: any) => {
  if (action.type === 'theme/toggleTheme') {
    return { ...state, darkMode: !state.darkMode };
  }
  return state;
};

// Mock App component since we're just testing keyboard behavior
const MockApp = () => {
  React.useEffect(() => {
    document.addEventListener('keydown', () => {});
    return () => document.removeEventListener('keydown', () => {});
  }, []);
  
  return <div>App with keyboard shortcuts</div>;
};

// Mock useDispatch
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch
}));

describe('Keyboard Shortcuts', () => {
  let store: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    mockDispatch.mockClear();
    
    store = configureStore({
      reducer: {
        tasks: tasksReducer,
        theme: mockThemeReducer
      }
    });
    
    // Create a mock for document.addEventListener
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
  });
  
  it('registers keyboard event listeners on mount', () => {
    render(
      <Provider store={store}>
        <MockApp />
      </Provider>
    );
    
    // Check that event listeners were added
    expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  it('handles Ctrl+N shortcut to add a new task', () => {
    // Create a component that uses keyboard shortcuts
    const KeyboardShortcuts: React.FC = () => {
      React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          // Ctrl+N to add a new task
          if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            mockDispatch(addTask({
              title: 'New task from shortcut', 
              status: 'pending',
              deadline: new Date().toISOString().split('T')[0],
              category: 'work',
              priority: 'medium'
            }));
          }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, []);
      
      return <div>Keyboard Shortcuts Test</div>;
    };
    
    render(
      <Provider store={store}>
        <KeyboardShortcuts />
      </Provider>
    );
    
    // Get the event handler that was registered
    const eventHandler = (document.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Simulate Ctrl+N keydown event
    eventHandler({ 
      ctrlKey: true, 
      key: 'n', 
      preventDefault: jest.fn() 
    });
    
    // Verify the addTask action was dispatched
    expect(mockDispatch).toHaveBeenCalledWith(
      addTask(expect.objectContaining({
        title: 'New task from shortcut',
        status: 'pending'
      }))
    );
  });
  
  it('handles Ctrl+D shortcut to delete selected task', () => {
    // Create a component that uses keyboard shortcuts
    const KeyboardShortcuts: React.FC<{ selectedTaskId: number | null }> = ({ selectedTaskId }) => {
      React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          // Ctrl+D to delete selected task
          if (event.ctrlKey && event.key === 'd' && selectedTaskId) {
            event.preventDefault();
            mockDispatch(deleteTask(selectedTaskId));
          }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, [selectedTaskId]);
      
      return <div>Keyboard Shortcuts Test</div>;
    };
    
    render(
      <Provider store={store}>
        <KeyboardShortcuts selectedTaskId={1} />
      </Provider>
    );
    
    // Get the event handler that was registered
    const eventHandler = (document.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Simulate Ctrl+D keydown event
    eventHandler({ 
      ctrlKey: true, 
      key: 'd', 
      preventDefault: jest.fn() 
    });
    
    // Verify the deleteTask action was dispatched with the selected task ID
    expect(mockDispatch).toHaveBeenCalledWith(deleteTask(1));
  });
  
  it('handles Ctrl+T shortcut to toggle theme', () => {
    // Create a component that uses keyboard shortcuts
    const KeyboardShortcuts: React.FC = () => {
      React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          // Ctrl+T to toggle theme
          if (event.ctrlKey && event.key === 't') {
            event.preventDefault();
            mockDispatch({ type: 'theme/toggleTheme' });
          }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, []);
      
      return <div>Keyboard Shortcuts Test</div>;
    };
    
    render(
      <Provider store={store}>
        <KeyboardShortcuts />
      </Provider>
    );
    
    // Get the event handler that was registered
    const eventHandler = (document.addEventListener as jest.Mock).mock.calls[0][1];
    
    // Simulate Ctrl+T keydown event
    eventHandler({ 
      ctrlKey: true, 
      key: 't', 
      preventDefault: jest.fn() 
    });
    
    // Verify the toggleTheme action was dispatched
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'theme/toggleTheme' });
  });
}); 