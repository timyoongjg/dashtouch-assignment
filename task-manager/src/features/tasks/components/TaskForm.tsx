import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../hooks';
import { 
  Task, 
  addTask, 
  updateTask, 
  TaskCategory, 
  TaskPriority, 
  categoryColors,
  priorityIndicators
} from '../tasksSlice';

interface TaskFormProps {
  task?: Task;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

interface TaskFormInputs {
  title: string;
  status: 'pending' | 'completed';
  deadline: string;
  category: TaskCategory;
  priority: TaskPriority;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmitSuccess, onCancel }) => {
  const dispatch = useAppDispatch();
  const isEditMode = !!task;

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setValue,
    watch
  } = useForm<TaskFormInputs>({
    defaultValues: {
      title: '',
      status: 'pending',
      deadline: new Date().toISOString().split('T')[0],
      category: 'work',
      priority: 'medium'
    }
  });

  // Watch for category and priority to update the preview
  const currentCategory = watch('category') as TaskCategory;
  const currentPriority = watch('priority') as TaskPriority;

  // If task is provided, populate form with task data
  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('status', task.status);
      setValue('deadline', task.deadline);
      setValue('category', task.category);
      setValue('priority', task.priority);
    }
  }, [task, setValue]);

  // Reset form after successful submission
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }
  }, [isSubmitSuccessful, reset, onSubmitSuccess]);

  const onSubmit = (data: TaskFormInputs) => {
    if (isEditMode && task) {
      dispatch(updateTask({
        id: task.id,
        ...data
      }));
    } else {
      dispatch(addTask(data));
    }
  };

  // Create a keyboard shortcut for form submission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSubmit, onSubmit]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
      <h2>{isEditMode ? 'Edit Task' : 'Add New Task'}</h2>
      
      <div style={formGroupStyle}>
        <label htmlFor="title">Task Title</label>
        <input
          id="title"
          style={{
            ...inputStyle,
            ...(errors.title ? inputErrorStyle : {})
          }}
          {...register('title', { 
            required: 'Title is required',
            minLength: { value: 3, message: 'Title must be at least 3 characters' }
          })}
        />
        {errors.title && <span style={errorStyle}>{errors.title.message}</span>}
      </div>
      
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <div style={formGroupStyle}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              style={{
                ...inputStyle,
                borderLeft: `5px solid ${categoryColors[currentCategory] || '#ddd'}`
              }}
              {...register('category')}
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="shopping">Shopping</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div style={{ flex: '1', minWidth: '200px' }}>
          <div style={formGroupStyle}>
            <label htmlFor="priority">Priority {priorityIndicators[currentPriority]}</label>
            <select
              id="priority"
              style={inputStyle}
              {...register('priority')}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        {isEditMode && (
          <div style={{ flex: '1', minWidth: '200px' }}>
            <div style={formGroupStyle}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                style={inputStyle}
                {...register('status')}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        )}
        
        <div style={{ flex: '1', minWidth: '200px' }}>
          <div style={formGroupStyle}>
            <label htmlFor="deadline">Deadline</label>
            <input
              id="deadline"
              type="date"
              style={{
                ...inputStyle,
                ...(errors.deadline ? inputErrorStyle : {})
              }}
              {...register('deadline', { 
                required: 'Deadline is required',
                validate: (value) => {
                  const date = new Date(value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // reset to start of day for fair comparison
                  return date >= today || 'Deadline cannot be in the past';
                }
              })}
            />
            {errors.deadline && <span style={errorStyle}>{errors.deadline.message}</span>}
          </div>
        </div>
      </div>
      
      <div style={formHintStyle}>
        <kbd>Ctrl</kbd> + <kbd>S</kbd> or <kbd>⌘</kbd> + <kbd>S</kbd> to save
      </div>
      
      <div style={formActionsStyle}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          style={submitButtonStyle}
        >
          {isEditMode ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

const formStyle = {
  backgroundColor: 'var(--bg-secondary)',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '600px',
  margin: '20px 0',
  boxShadow: '0 2px 4px var(--shadow-color)'
};

const formGroupStyle = {
  marginBottom: '15px',
  display: 'flex',
  flexDirection: 'column' as const
};

const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  fontSize: '16px',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  transition: 'border-color 0.2s ease-in-out'
};

const inputErrorStyle = {
  borderColor: 'var(--danger-color)'
};

const errorStyle = {
  color: 'var(--danger-color)',
  fontSize: '14px',
  marginTop: '5px'
};

const formActionsStyle = {
  marginTop: '20px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px'
};

const formHintStyle = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
  marginTop: '15px',
  textAlign: 'right' as const
};

const submitButtonStyle = {
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

const cancelButtonStyle = {
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  padding: '10px 15px',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

export default TaskForm; 