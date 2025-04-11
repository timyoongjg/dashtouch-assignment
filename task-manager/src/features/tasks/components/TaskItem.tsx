import React, { useState } from 'react';
import { useAppDispatch } from '../../../hooks';
import { 
  Task, 
  toggleTaskStatus, 
  deleteTask,
  categoryColors,
  priorityIndicators
} from '../tasksSlice';
import TaskForm from './TaskForm';

/**
 * Props interface for TaskItem component
 */
interface TaskItemProps {
  /** The task object to display and manage */
  task: Task;
}

/**
 * Component for displaying and managing a single task
 * 
 * Provides UI for:
 * - Viewing task details
 * - Toggling task status
 * - Editing task properties
 * - Deleting the task
 * 
 * @param {TaskItemProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  /**
   * Toggle the task's status between pending and completed
   */
  const handleToggleStatus = (): void => {
    dispatch(toggleTaskStatus(task.id));
  };

  /**
   * Delete the task after confirmation
   */
  const handleDelete = (): void => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(task.id));
    }
  };

  /**
   * Get the appropriate color for the status badge
   * @returns {string} CSS color variable
   */
  const getStatusColor = (): string => {
    return task.status === 'completed' ? 'var(--success-color)' : 'var(--warning-color)';
  };

  /**
   * Calculate the number of days remaining until the deadline
   * @returns {number} Days until deadline (negative if overdue)
   */
  const getDaysRemaining = (): number => {
    const today = new Date();
    const deadline = new Date(task.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Determine the appropriate color for the deadline text based on time remaining
   * @returns {string} CSS color variable
   */
  const getDeadlineColor = (): string => {
    if (task.status === 'completed') return 'inherit';
    
    const daysRemaining = getDaysRemaining();
    
    if (daysRemaining < 0) return 'var(--danger-color)';
    if (daysRemaining <= 3) return 'var(--warning-color)';
    if (daysRemaining <= 7) return 'var(--warning-color)';
    return 'inherit';
  };

  /**
   * Format the deadline with additional context information
   * @returns {string} Formatted deadline string
   */
  const formatDeadline = (): string => {
    const daysRemaining = getDaysRemaining();
    const formattedDate = new Date(task.deadline).toLocaleDateString();
    
    if (task.status === 'completed') {
      return formattedDate;
    }
    
    if (daysRemaining < 0) {
      return `${formattedDate} (Overdue by ${Math.abs(daysRemaining)} days)`;
    }
    
    if (daysRemaining === 0) {
      return `${formattedDate} (Due today)`;
    }
    
    return `${formattedDate} (${daysRemaining} days left)`;
  };

  // When in editing mode, render the edit form
  if (isEditing) {
    return (
      <tr>
        <td colSpan={7}>
          <TaskForm 
            task={task} 
            onSubmitSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </td>
      </tr>
    );
  }

  // Default view mode
  return (
    <tr style={{ 
      backgroundColor: task.status === 'completed' ? 'var(--bg-secondary)' : 'var(--bg-primary)',
      transition: 'background-color 0.2s'
    }}>
      <td>{task.id}</td>
      <td>{task.title}</td>
      <td>
        <div 
          style={{ 
            display: 'inline-block',
            backgroundColor: categoryColors[task.category],
            color: 'white',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem'
          }}
        >
          {task.category}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '5px' }}>{priorityIndicators[task.priority]}</span>
          <span>{task.priority}</span>
        </div>
      </td>
      <td>
        <span 
          style={{ 
            display: 'inline-block',
            backgroundColor: getStatusColor(),
            color: 'white',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem'
          }}
        >
          {task.status}
        </span>
      </td>
      <td style={{ color: getDeadlineColor() }}>{formatDeadline()}</td>
      <td>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleToggleStatus}
            style={{ 
              backgroundColor: task.status === 'completed' ? 'var(--warning-color)' : 'var(--success-color)',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title={task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
          >
            {task.status === 'completed' ? '↩' : '✓'}
          </button>
          <button 
            onClick={() => setIsEditing(true)}
            style={{ 
              backgroundColor: 'var(--info-color)',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="Edit Task"
          >
            ✎
          </button>
          <button 
            onClick={handleDelete}
            style={{ 
              backgroundColor: 'var(--danger-color)',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="Delete Task"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TaskItem; 