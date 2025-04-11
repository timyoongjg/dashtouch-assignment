import React, { useState, useMemo, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../../hooks';
import { 
  selectAllTasks, 
  selectTasksByStatus, 
  selectTasksBySearchTerm,
  selectTasksByCategory,
  selectTasksByPriority,
  selectTasksSortedByField,
  Task,
  TaskCategory,
  TaskPriority,
  categoryColors,
  priorityIndicators,
  updateTaskOrder,
  toggleTaskStatus,
  deleteTask
} from '../tasksSlice';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

type SortField = keyof Task | '';
type SortDirection = 'asc' | 'desc';

const KEYBOARD_SHORTCUTS = [
  { key: 'n', description: 'New task' },
  { key: 'f', description: 'Focus search' },
  { key: 'c', description: 'Clear filters' },
  { key: '?', description: 'Show/hide shortcuts' },
];

const TaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // State for filters and sorting
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // State for UI
  const [showAddForm, setShowAddForm] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get all tasks from Redux
  const allTasks = useAppSelector(selectAllTasks);
  const pendingTasks = useAppSelector(selectTasksByStatus('pending'));
  const completedTasks = useAppSelector(selectTasksByStatus('completed'));
  
  // Apply filters
  const filteredByStatus = useMemo(() => {
    if (statusFilter === 'all') return allTasks;
    return statusFilter === 'pending' ? pendingTasks : completedTasks;
  }, [statusFilter, allTasks, pendingTasks, completedTasks]);
  
  const filteredByCategory = useMemo(() => {
    if (categoryFilter === 'all') return filteredByStatus;
    return filteredByStatus.filter(task => task.category === categoryFilter);
  }, [filteredByStatus, categoryFilter]);
  
  const filteredByPriority = useMemo(() => {
    if (priorityFilter === 'all') return filteredByCategory;
    return filteredByCategory.filter(task => task.priority === priorityFilter);
  }, [filteredByCategory, priorityFilter]);
  
  // Apply search term
  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return filteredByPriority;
    
    const term = searchTerm.toLowerCase();
    return filteredByPriority.filter(task => 
      task.title.toLowerCase().includes(term)
    );
  }, [filteredByPriority, searchTerm]);
  
  // Apply sorting
  const tasks = useMemo(() => {
    if (!sortField) return filteredTasks;
    
    return [...filteredTasks].sort((a, b) => {
      if (sortField === 'deadline') {
        const dateA = new Date(a[sortField]).getTime();
        const dateB = new Date(b[sortField]).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'priority') {
        const priorityValue = { high: 0, medium: 1, low: 2 };
        const valueA = priorityValue[a.priority as TaskPriority];
        const valueB = priorityValue[b.priority as TaskPriority];
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        const valueA = String(a[sortField]).toLowerCase();
        const valueB = String(b[sortField]).toLowerCase();
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [filteredTasks, sortField, sortDirection]);

  // Keyboard shortcut handling
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond to keyboard shortcuts if no input is focused
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                             document.activeElement?.tagName === 'TEXTAREA' ||
                             document.activeElement?.tagName === 'SELECT';
      
      if (isInputFocused) return;
      
      switch (e.key.toLowerCase()) {
        case 'n': // New task
          e.preventDefault();
          setShowAddForm(true);
          break;
        case 'f': // Focus search
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'c': // Clear filters
          e.preventDefault();
          setStatusFilter('all');
          setCategoryFilter('all');
          setPriorityFilter('all');
          setSearchTerm('');
          break;
        case '?': // Show/hide shortcuts
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if the same field is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset to ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Drag and drop functionality
  const handleDragStart = (taskId: number) => {
    setIsDragging(true);
    setDraggedTaskId(taskId);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedTaskId(null);
  };
  
  const handleDragOver = (taskId: number) => {
    if (draggedTaskId === null || draggedTaskId === taskId) return;
    
    // Reorder the tasks
    const tasksCopy = [...tasks];
    const draggedIndex = tasksCopy.findIndex(t => t.id === draggedTaskId);
    const dropIndex = tasksCopy.findIndex(t => t.id === taskId);
    
    if (draggedIndex === -1 || dropIndex === -1) return;
    
    // Move the dragged task to the new position
    const [draggedTask] = tasksCopy.splice(draggedIndex, 1);
    tasksCopy.splice(dropIndex, 0, draggedTask);
    
    // Update the Redux store with the new order
    dispatch(updateTaskOrder({ taskIds: tasksCopy.map(t => t.id) }));
  };

  // Add helper functions for deadline formatting and task actions
  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDeadline = (deadline: string) => {
    const daysRemaining = getDaysRemaining(deadline);
    const formattedDate = new Date(deadline).toLocaleDateString();
    
    if (daysRemaining < 0) {
      return `${formattedDate} (Overdue by ${Math.abs(daysRemaining)} days)`;
    }
    
    if (daysRemaining === 0) {
      return `${formattedDate} (Due today)`;
    }
    
    return `${formattedDate} (${daysRemaining} days left)`;
  };

  const handleToggleStatus = (taskId: number) => {
    dispatch(toggleTaskStatus(taskId));
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(taskId));
    }
  };

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  return (
    <div className="task-list-container">
      {/* Search, filter and shortcut display */}
      <div style={controlsContainerStyle}>
        <div style={searchContainerStyle}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={clearButtonStyle}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        <div style={filterContainerStyle}>
          {/* Status filter */}
          <div style={filterSelectStyle}>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed')}
              style={selectStyle}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {/* Category filter */}
          <div style={filterSelectStyle}>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | TaskCategory)}
              style={selectStyle}
            >
              <option value="all">All Categories</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="shopping">Shopping</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Priority filter */}
          <div style={filterSelectStyle}>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value as 'all' | TaskPriority)}
              style={selectStyle}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {/* Help icon for shortcuts */}
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            style={helpButtonStyle}
            title="Keyboard shortcuts"
          >
            ?
          </button>
        </div>
      </div>
      
      {/* Keyboard shortcuts panel */}
      {showShortcuts && (
        <div style={shortcutsPanelStyle}>
          <h3 style={{ marginTop: 0 }}>Keyboard Shortcuts</h3>
          <ul style={{ paddingLeft: '20px' }}>
            {KEYBOARD_SHORTCUTS.map((shortcut) => (
              <li key={shortcut.key} style={{ marginBottom: '8px' }}>
                <kbd style={kbdStyle}>{shortcut.key}</kbd> - {shortcut.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Add task button and form */}
      <div style={{ margin: '20px 0' }}>
        {!showAddForm && !editingTask ? (
          <button 
            onClick={() => setShowAddForm(true)}
            style={addTaskButtonStyle}
          >
            + Add New Task
          </button>
        ) : (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {editingTask ? (
              <TaskForm 
                task={editingTask}
                onSubmitSuccess={() => setEditingTask(null)}
                onCancel={() => setEditingTask(null)}
              />
            ) : (
              <TaskForm 
                onSubmitSuccess={() => setShowAddForm(false)}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Tasks table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={tableHeaderStyle} onClick={() => handleSort('id')}>
                ID {getSortIcon('id')}
              </th>
              <th style={tableHeaderStyle} onClick={() => handleSort('title')}>
                Title {getSortIcon('title')}
              </th>
              <th style={tableHeaderStyle} onClick={() => handleSort('category')}>
                Category {getSortIcon('category')}
              </th>
              <th style={tableHeaderStyle} onClick={() => handleSort('priority')}>
                Priority {getSortIcon('priority')}
              </th>
              <th style={tableHeaderStyle} onClick={() => handleSort('status')}>
                Status {getSortIcon('status')}
              </th>
              <th style={tableHeaderStyle} onClick={() => handleSort('deadline')}>
                Deadline {getSortIcon('deadline')}
              </th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map(task => (
                <tr 
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={() => handleDragOver(task.id)}
                  style={{ 
                    cursor: isDragging ? 'grabbing' : 'grab',
                    backgroundColor: task.status === 'completed' ? 'var(--bg-secondary)' : 'var(--bg-primary)'
                  }}
                >
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
                        backgroundColor: task.status === 'completed' ? 'var(--success-color)' : 'var(--warning-color)',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td style={{ 
                    color: task.status === 'completed' ? 'inherit' : 
                      (getDaysRemaining(task.deadline) < 0 ? 'var(--danger-color)' : 
                      (getDaysRemaining(task.deadline) <= 3 ? 'var(--warning-color)' : 'inherit'))
                  }}>
                    {formatDeadline(task.deadline)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleToggleStatus(task.id)}
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
                        onClick={() => handleEditTask(task)}
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
                        onClick={() => handleDeleteTask(task.id)}
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
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                    ? 'No matching tasks found. Try adjusting your filters.'
                    : 'No tasks found. Add a new task to get started!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Task count summary */}
      <div style={{ margin: '20px 0', textAlign: 'right', color: '#666' }}>
        Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        {statusFilter !== 'all' && ` (${statusFilter})`}
        {categoryFilter !== 'all' && ` in ${categoryFilter}`}
        {priorityFilter !== 'all' && ` with ${priorityFilter} priority`}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>
      
      {/* Drag & drop hint */}
      <div style={{ 
        textAlign: 'center',
        color: '#666',
        fontSize: '12px',
        marginTop: '10px'
      }}>
        Pro tip: Drag and drop to reorder tasks
      </div>
    </div>
  );
};

// Responsive styles
const controlsContainerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px',
  margin: '20px 0',
  '@media (min-width: 768px)': {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const
  }
};

const searchContainerStyle = {
  flex: '1',
  position: 'relative' as const
};

const clearButtonStyle = {
  position: 'absolute' as const,
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: 'var(--text-secondary)'
};

const filterContainerStyle = {
  display: 'flex',
  alignItems: 'center' as const,
  flexWrap: 'wrap' as const,
  gap: '10px'
};

const filterSelectStyle = {
  minWidth: '120px',
};

const helpButtonStyle = {
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: 'var(--bg-secondary)',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: 'var(--text-secondary)'
};

const shortcutsPanelStyle = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
  padding: '15px',
  marginBottom: '20px',
  boxShadow: '0 2px 4px var(--shadow-color)'
};

const kbdStyle = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '3px',
  boxShadow: '0 1px 0 var(--shadow-color)',
  color: 'var(--text-primary)',
  display: 'inline-block',
  fontSize: '12px',
  fontFamily: 'monospace',
  padding: '2px 5px',
  marginRight: '5px'
};

const searchInputStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: '16px',
  width: '100%',
  paddingRight: '30px' // Space for the clear button
};

const selectStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: '16px'
};

const tableContainerStyle = {
  overflowX: 'auto' as const
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  minWidth: '600px'
};

const tableHeaderStyle = {
  textAlign: 'left' as const,
  padding: '10px',
  borderBottom: '2px solid var(--border-color)',
  cursor: 'pointer'
};

const addTaskButtonStyle = {
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer'
};

export default TaskList; 