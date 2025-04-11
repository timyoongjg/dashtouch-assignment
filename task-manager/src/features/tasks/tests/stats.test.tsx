import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import Dashboard from '../components/Dashboard';
import tasksReducer, { selectTaskStatistics } from '../tasksSlice';
import { RootState } from '../../../store';

describe('Statistics Dashboard', () => {
  const mockStore = configureStore({
    reducer: {
      tasks: tasksReducer
    }
  });

  it('calculates task statistics correctly', () => {
    const state = mockStore.getState() as RootState;
    const stats = selectTaskStatistics(state);
    
    // Test that we have statistics objects
    expect(stats).toBeDefined();
    expect(stats.totalTasks).toBeGreaterThan(0);
    expect(stats.completedTasks).toBeDefined();
    expect(stats.pendingTasks).toBeDefined();
    expect(stats.completionRate).toBeDefined();
    
    // Test calculation correctness
    expect(stats.totalTasks).toBe(stats.completedTasks + stats.pendingTasks);
    expect(stats.completionRate).toBe(
      Math.round((stats.completedTasks / stats.totalTasks) * 100)
    );
    
    // Test category and priority statistics
    expect(stats.categoryCounts).toBeDefined();
    expect(stats.priorityCounts).toBeDefined();
    
    // Check that category counts add up to total tasks
    const categoryTotal = Object.values(stats.categoryCounts).reduce((sum, count) => sum + count, 0);
    expect(categoryTotal).toBe(stats.totalTasks);
    
    // Check that priority counts add up to total tasks
    const priorityTotal = Object.values(stats.priorityCounts).reduce((sum, count) => sum + count, 0);
    expect(priorityTotal).toBe(stats.totalTasks);
  });

  it('renders the dashboard with statistics data', () => {
    render(
      <Provider store={mockStore}>
        <Dashboard />
      </Provider>
    );
    
    // Check for dashboard title (update to match actual component)
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    
    // Check for key statistics sections (these exact text values may need adjustment based on your implementation)
    expect(screen.getByText(/Task Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Tasks/i)).toBeInTheDocument();
    
    // Use getAllByText for elements that appear multiple times
    expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pending/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Completion Rate/i)).toBeInTheDocument();
    
    // Check for category and priority charts/sections
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
    expect(screen.getByText(/Priorities/i)).toBeInTheDocument();
  });
}); 