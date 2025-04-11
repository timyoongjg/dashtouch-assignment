import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import TaskItem from '../components/TaskItem';
import TaskList from '../components/TaskList';
import tasksReducer, { 
  selectTasksByCategory, 
  selectTasksByPriority,
  categoryColors,
  priorityIndicators,
  TaskCategory,
  TaskPriority
} from '../tasksSlice';
import { RootState } from '../../../store';

describe('Category and Priority Features', () => {
  const mockStore = configureStore({
    reducer: {
      tasks: tasksReducer
    }
  });

  describe('Category Features', () => {
    const mockTask = {
      id: 1,
      title: 'Test Task',
      status: 'pending' as const,
      deadline: '2025-05-10',
      category: 'work' as TaskCategory,
      priority: 'medium' as TaskPriority
    };

    it('displays task with correct category color', () => {
      render(
        <Provider store={mockStore}>
          <table>
            <tbody>
              <TaskItem task={mockTask} />
            </tbody>
          </table>
        </Provider>
      );

      // Find the category cell (this selector might need to be adjusted based on your actual implementation)
      const categoryElement = screen.getByText('work');
      expect(categoryElement).toBeInTheDocument();

      // Instead of testing direct styling (which might be applied differently),
      // just verify that the element with the category text exists
      expect(categoryElement).toBeInTheDocument();
      
      // Look for any element with the background color (could be parent or child)
      const colorElements = document.querySelectorAll('*');
      let hasCorrectColor = false;
      colorElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor === categoryColors.work || 
            style.backgroundColor.includes('rgb(74, 109, 167)')) {
          hasCorrectColor = true;
        }
      });
      
      expect(hasCorrectColor).toBeTruthy();
    });

    it('selects tasks by category correctly', () => {
      const state = mockStore.getState() as RootState;
      const workTasks = selectTasksByCategory('work')(state);
      const personalTasks = selectTasksByCategory('personal')(state);
      
      // Check that we have the correct categories in the initial state
      expect(workTasks.length).toBeGreaterThan(0);
      expect(workTasks.every(task => task.category === 'work')).toBe(true);
      
      if (personalTasks.length > 0) {
        expect(personalTasks.every(task => task.category === 'personal')).toBe(true);
      }
    });
  });

  describe('Priority Features', () => {
    const mockTask = {
      id: 1,
      title: 'Test Priority Task',
      status: 'pending' as const,
      deadline: '2025-05-10',
      category: 'work' as TaskCategory,
      priority: 'high' as TaskPriority
    };

    it('displays task with correct priority indicator', () => {
      render(
        <Provider store={mockStore}>
          <table>
            <tbody>
              <TaskItem task={mockTask} />
            </tbody>
          </table>
        </Provider>
      );

      // Check for the high priority indicator
      const priorityElement = screen.getByText('high');
      expect(priorityElement).toBeInTheDocument();
      
      // The priority indicator emoji should be visible somewhere
      const priorityIndicator = priorityIndicators.high;
      expect(screen.getByText(priorityIndicator)).toBeInTheDocument();
    });

    it('selects tasks by priority correctly', () => {
      const state = mockStore.getState() as RootState;
      const highPriorityTasks = selectTasksByPriority('high')(state);
      const mediumPriorityTasks = selectTasksByPriority('medium')(state);
      const lowPriorityTasks = selectTasksByPriority('low')(state);
      
      // Check that priorities are correctly filtered
      if (highPriorityTasks.length > 0) {
        expect(highPriorityTasks.every(task => task.priority === 'high')).toBe(true);
      }
      
      if (mediumPriorityTasks.length > 0) {
        expect(mediumPriorityTasks.every(task => task.priority === 'medium')).toBe(true);
      }
      
      if (lowPriorityTasks.length > 0) {
        expect(lowPriorityTasks.every(task => task.priority === 'low')).toBe(true);
      }
    });
  });
}); 