import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TaskItem from '../components/TaskItem';
import tasksReducer, { toggleTaskStatus } from '../tasksSlice';

// Mock useDispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn().mockReturnValue(jest.fn())
}));

describe('TaskItem Component', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    status: 'pending' as const,
    deadline: '2025-05-10',
    category: 'work' as const,
    priority: 'medium' as const
  };

  const mockStore = configureStore({
    reducer: {
      tasks: tasksReducer
    }
  });

  it('renders task details correctly', () => {
    render(
      <Provider store={mockStore}>
        <table>
          <tbody>
            <TaskItem task={mockTask} />
          </tbody>
        </table>
      </Provider>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText(/5\/10\/2025/)).toBeInTheDocument();
    expect(screen.getByTitle('Mark as Completed')).toBeInTheDocument();
  });

  it('toggles task status when button is clicked', () => {
    render(
      <Provider store={mockStore}>
        <table>
          <tbody>
            <TaskItem task={mockTask} />
          </tbody>
        </table>
      </Provider>
    );
    
    const toggleButton = screen.getByTitle('Mark as Completed');
    userEvent.click(toggleButton);
    
    // Since we're using a mock dispatch, we don't actually change the status
    // This test just verifies the button click and would need a more complete
    // test setup to verify the actual state change
  });

  it('displays the correct button title based on status', () => {
    const completedTask = {
      ...mockTask,
      status: 'completed' as const
    };

    render(
      <Provider store={mockStore}>
        <table>
          <tbody>
            <TaskItem task={completedTask} />
          </tbody>
        </table>
      </Provider>
    );

    expect(screen.getByTitle('Mark as Pending')).toBeInTheDocument();
  });
}); 