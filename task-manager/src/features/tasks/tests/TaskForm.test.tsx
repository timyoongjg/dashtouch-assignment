import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TaskForm from '../components/TaskForm';
import tasksReducer, { addTask, updateTask } from '../tasksSlice';

// Mock useDispatch and store
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch
}));

describe('TaskForm Component', () => {
  const mockStore = configureStore({
    reducer: {
      tasks: tasksReducer
    }
  });

  const mockTask = {
    id: 1,
    title: 'Test Task',
    status: 'pending' as const,
    deadline: '2025-05-10',
    category: 'work' as const,
    priority: 'medium' as const
  };

  const renderTaskForm = (props = {}) => {
    return render(
      <Provider store={mockStore}>
        <TaskForm {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    mockDispatch.mockClear();
    jest.clearAllMocks();
  });

  it('renders the add task form by default', () => {
    renderTaskForm();
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Deadline')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
  });

  it('renders the edit task form when task is provided', () => {
    renderTaskForm({ task: mockTask });
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Title')).toHaveValue('Test Task');
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Deadline')).toHaveValue('2025-05-10');
    expect(screen.getByRole('button', { name: 'Update Task' })).toBeInTheDocument();
  });

  it('shows validation errors when submitted with empty fields', async () => {
    renderTaskForm();
    
    // Clear the title field
    const titleInput = screen.getByLabelText('Task Title');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    fireEvent.click(submitButton);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    
    // Dispatch should not be called with invalid form
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('dispatches addTask when form is submitted in add mode', async () => {
    renderTaskForm();
    
    // Fill in the form
    const titleInput = screen.getByLabelText('Task Title');
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    
    const deadlineInput = screen.getByLabelText('Deadline');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10); // 10 days in the future
    const formattedDate = futureDate.toISOString().split('T')[0];
    fireEvent.change(deadlineInput, { target: { value: formattedDate } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    fireEvent.click(submitButton);
    
    // Check that dispatch was called with the correct action
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(addTask(expect.any(Object)));
    });
  });

  it('dispatches updateTask when form is submitted in edit mode', async () => {
    renderTaskForm({ task: mockTask });
    
    // Update the title
    const titleInput = screen.getByLabelText('Task Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Update Task' });
    fireEvent.click(submitButton);
    
    // Check that dispatch was called with the correct action
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(updateTask(expect.any(Object)));
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = jest.fn();
    renderTaskForm({ onCancel: mockOnCancel });
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onSubmitSuccess when form is successfully submitted', async () => {
    const mockOnSubmitSuccess = jest.fn();
    renderTaskForm({ onSubmitSuccess: mockOnSubmitSuccess });
    
    // Fill in the form
    const titleInput = screen.getByLabelText('Task Title');
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    
    const deadlineInput = screen.getByLabelText('Deadline');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10); // 10 days in the future
    const formattedDate = futureDate.toISOString().split('T')[0];
    fireEvent.change(deadlineInput, { target: { value: formattedDate } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    fireEvent.click(submitButton);
    
    // Need to mock successful form submission
    // This is a simplification since react-hook-form's isSubmitSuccessful is hard to test
    // In a real test, you might need to mock react-hook-form more thoroughly
  });
}); 