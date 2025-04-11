import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer, {
  selectTasksBySearchTerm,
  selectTasksSortedByDeadline,
  selectTasksSortedByPriority,
  selectTasksSortedByField
} from '../tasksSlice';
import { RootState } from '../../../store';

describe('Filtering and Sorting Features', () => {
  const mockStore = configureStore({
    reducer: {
      tasks: tasksReducer
    }
  });

  describe('Filtering Tasks', () => {
    it('filters tasks by search term correctly', () => {
      const state = mockStore.getState() as RootState;
      
      // Get a title from an existing task to search for
      const existingTitle = state.tasks.tasks[0].title;
      const searchTerm = existingTitle.substring(0, 3);
      
      // Filter tasks by this search term
      const filteredTasks = selectTasksBySearchTerm(searchTerm)(state);
      
      // Verify that all returned tasks include the search term
      expect(filteredTasks.length).toBeGreaterThan(0);
      expect(filteredTasks.every(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      )).toBe(true);
      
      // Filter with a non-existent term
      const nonExistentTerm = 'xyzabcnonexistent12345';
      const emptyResults = selectTasksBySearchTerm(nonExistentTerm)(state);
      expect(emptyResults.length).toBe(0);
      
      // Empty search term should return all tasks
      const allTasks = selectTasksBySearchTerm('')(state);
      expect(allTasks.length).toBe(state.tasks.tasks.length);
    });
  });

  describe('Sorting Tasks', () => {
    it('sorts tasks by deadline correctly', () => {
      const state = mockStore.getState() as RootState;
      const sortedTasks = selectTasksSortedByDeadline(state);
      
      // Verify tasks are sorted by deadline
      for (let i = 0; i < sortedTasks.length - 1; i++) {
        const currentDate = new Date(sortedTasks[i].deadline).getTime();
        const nextDate = new Date(sortedTasks[i + 1].deadline).getTime();
        expect(currentDate).toBeLessThanOrEqual(nextDate);
      }
    });
    
    it('sorts tasks by priority correctly', () => {
      const state = mockStore.getState() as RootState;
      const sortedTasks = selectTasksSortedByPriority(state);
      
      // Define priority values for comparison
      const priorityValue = { high: 0, medium: 1, low: 2 };
      
      // Verify tasks are sorted by priority
      for (let i = 0; i < sortedTasks.length - 1; i++) {
        const currentPriority = sortedTasks[i].priority;
        const nextPriority = sortedTasks[i + 1].priority;
        expect(priorityValue[currentPriority]).toBeLessThanOrEqual(priorityValue[nextPriority]);
      }
    });
    
    it('sorts tasks by different fields and directions', () => {
      const state = mockStore.getState() as RootState;
      
      // Test sorting by title ascending
      const sortedByTitleAsc = selectTasksSortedByField('title', 'asc')(state);
      for (let i = 0; i < sortedByTitleAsc.length - 1; i++) {
        const current = sortedByTitleAsc[i].title.toLowerCase();
        const next = sortedByTitleAsc[i + 1].title.toLowerCase();
        expect(current <= next).toBe(true);
      }
      
      // Test sorting by title descending
      const sortedByTitleDesc = selectTasksSortedByField('title', 'desc')(state);
      for (let i = 0; i < sortedByTitleDesc.length - 1; i++) {
        const current = sortedByTitleDesc[i].title.toLowerCase();
        const next = sortedByTitleDesc[i + 1].title.toLowerCase();
        expect(current >= next).toBe(true);
      }
      
      // Test sorting by deadline descending (most recent first)
      const sortedByDeadlineDesc = selectTasksSortedByField('deadline', 'desc')(state);
      for (let i = 0; i < sortedByDeadlineDesc.length - 1; i++) {
        const currentDate = new Date(sortedByDeadlineDesc[i].deadline).getTime();
        const nextDate = new Date(sortedByDeadlineDesc[i + 1].deadline).getTime();
        expect(currentDate).toBeGreaterThanOrEqual(nextDate);
      }
    });
  });
}); 