import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../hooks';
import { addTask, TaskCategory, TaskPriority, categoryColors } from '../tasksSlice';

interface TaskFormInputs {
  title: string;
  deadline: string;
  category: TaskCategory;
  priority: TaskPriority;
}

const AddTaskForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<TaskFormInputs>({
    defaultValues: {
      title: '',
      deadline: new Date().toISOString().split('T')[0],
      category: 'work',
      priority: 'medium'
    }
  });

  // Watch for category to update the visual indicator
  const currentCategory = watch('category') as TaskCategory;

  const onSubmit = (data: TaskFormInputs) => {
    dispatch(addTask({
      title: data.title,
      status: 'pending',
      deadline: data.deadline,
      category: data.category,
      priority: data.priority
    }));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
      <h2>Add New Task</h2>
      
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
            <label htmlFor="priority">Priority</label>
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
      
      <button
        type="submit"
        style={buttonStyle}
      >
        Add Task
      </button>
    </form>
  );
};

const formStyle = {
  backgroundColor: 'var(--bg-secondary)',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '500px',
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
  transition: 'border-color 0.2s'
};

const inputErrorStyle = {
  borderColor: 'var(--danger-color)'
};

const buttonStyle = {
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

const errorStyle = {
  color: 'var(--danger-color)',
  fontSize: '14px',
  marginTop: '5px'
};

export default AddTaskForm; 