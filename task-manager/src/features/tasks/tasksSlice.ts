import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

/**
 * Available task categories
 */
export type TaskCategory = 'work' | 'personal' | 'shopping' | 'health' | 'finance' | 'other';

/**
 * Available task priority levels
 */
export type TaskPriority = 'high' | 'medium' | 'low';

/**
 * Color mappings for different task categories
 */
export const categoryColors: Record<TaskCategory, string> = {
  work: '#4a6da7',      // Blue
  personal: '#9c59b6',  // Purple
  shopping: '#3cb878',  // Green
  health: '#e74c3c',    // Red
  finance: '#f39c12',   // Orange
  other: '#95a5a6'      // Gray
};

/**
 * Visual indicators for different priority levels
 */
export const priorityIndicators: Record<TaskPriority, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢'
};

/**
 * Load task data from localStorage
 * @returns {Object} Object containing tasks array and next ID
 */
const loadTasksFromStorage = (): { tasks: Task[], nextId: number } => {
  try {
    const storedTasks = localStorage.getItem('tasks');
    const storedNextId = localStorage.getItem('nextId');
    
    if (storedTasks && storedNextId) {
      return { 
        tasks: JSON.parse(storedTasks), 
        nextId: parseInt(storedNextId, 10) 
      };
    }
  } catch (error) {
    console.error('Failed to load tasks from local storage', error);
  }
  
  // Return default initial state if local storage is not available or empty
  return {
    tasks: [
      { id: 1, title: "Fix login bug", status: "pending", deadline: "2025-05-10", category: "work", priority: "high" },
      { id: 2, title: "Write unit tests", status: "completed", deadline: "2025-06-01", category: "work", priority: "medium" },
      { id: 3, title: "Update README documentation", status: "pending", deadline: "2025-04-15", category: "work", priority: "low" },
      { id: 4, title: "Design new user profile page", status: "pending", deadline: "2025-04-01", category: "personal", priority: "medium" },
      { id: 5, title: "Buy groceries", status: "pending", deadline: "2025-04-05", category: "shopping", priority: "high" },
      { id: 6, title: "Schedule doctor appointment", status: "completed", deadline: "2025-04-10", category: "health", priority: "high" },
      { id: 7, title: "Pay utility bills", status: "pending", deadline: "2025-04-20", category: "finance", priority: "medium" }
    ],
    nextId: 8
  };
};

/**
 * Task interface defining the shape of task objects
 */
export interface Task {
  /** Unique identifier for the task */
  id: number;
  /** Title/description of the task */
  title: string;
  /** Current status of the task */
  status: 'pending' | 'completed';
  /** Task deadline date in ISO format */
  deadline: string;
  /** Category the task belongs to */
  category: TaskCategory;
  /** Priority level of the task */
  priority: TaskPriority;
}

/**
 * State interface for the tasks slice
 */
interface TasksState {
  /** Array of task objects */
  tasks: Task[];
  /** Next available ID for new tasks */
  nextId: number;
  /** Array of IDs that have been deleted and can be reused */
  deletedIds: number[];
}

/**
 * Initial state for the tasks slice
 */
const initialState: TasksState = {
  ...loadTasksFromStorage(),
  deletedIds: []
};

/**
 * Save the current state to localStorage
 * @param {TasksState} state - Current state to save
 */
const saveToLocalStorage = (state: TasksState): void => {
  try {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
    localStorage.setItem('nextId', state.nextId.toString());
    // We don't persist deletedIds to avoid potential issues with duplicate IDs
  } catch (error) {
    console.error('Failed to save tasks to local storage', error);
  }
};

/**
 * Redux slice for task management
 */
export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /**
     * Add a new task
     * @param {TasksState} state - Current state
     * @param {PayloadAction<Omit<Task, 'id'>>} action - New task data without ID
     */
    addTask: (state, action: PayloadAction<Omit<Task, 'id'>>) => {
      // Check if we have deleted IDs to reuse
      let newId: number;
      if (state.deletedIds.length > 0) {
        // Reuse the smallest deleted ID
        state.deletedIds.sort((a, b) => a - b);
        newId = state.deletedIds.shift()!;
      } else {
        // Use the next sequential ID
        newId = state.nextId;
        state.nextId += 1;
      }
      
      const newTask = {
        id: newId,
        ...action.payload
      };
      state.tasks.push(newTask);
      saveToLocalStorage(state);
    },
    
    /**
     * Update an existing task
     * @param {TasksState} state - Current state
     * @param {PayloadAction<Partial<Task> & { id: number }>} action - Partial task data with ID
     */
    updateTask: (state, action: PayloadAction<Partial<Task> & { id: number }>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
        saveToLocalStorage(state);
      }
    },
    
    /**
     * Toggle a task's status between pending and completed
     * @param {TasksState} state - Current state
     * @param {PayloadAction<number>} action - ID of task to toggle
     */
    toggleTaskStatus: (state, action: PayloadAction<number>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload);
      if (index !== -1) {
        state.tasks[index].status = state.tasks[index].status === 'pending' ? 'completed' : 'pending';
        saveToLocalStorage(state);
      }
    },
    
    /**
     * Delete a task by ID
     * @param {TasksState} state - Current state
     * @param {PayloadAction<number>} action - ID of task to delete
     */
    deleteTask: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.tasks = state.tasks.filter(task => task.id !== id);
      // Store the deleted ID for future reuse
      state.deletedIds.push(id);
      saveToLocalStorage(state);
    },
    
    /**
     * Update the order of tasks (for drag and drop)
     * @param {TasksState} state - Current state
     * @param {PayloadAction<{ taskIds: number[] }>} action - New order of task IDs
     */
    updateTaskOrder: (state, action: PayloadAction<{ taskIds: number[] }>) => {
      const { taskIds } = action.payload;
      // Create a map for quick lookup of order index
      const orderMap = new Map(taskIds.map((id, index) => [id, index]));
      
      // Sort tasks based on the new order
      state.tasks.sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const orderB = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });
      
      saveToLocalStorage(state);
    },
    
    /**
     * Reset the tasks state to initial sample data
     * @param {TasksState} state - Current state
     */
    resetToSampleData: (state) => {
      // Clear localStorage
      localStorage.removeItem('tasks');
      localStorage.removeItem('nextId');
      
      // Reset to initial sample data
      const sampleData = loadTasksFromStorage();
      state.tasks = sampleData.tasks;
      state.nextId = sampleData.nextId;
      state.deletedIds = [];
    }
  }
});

export const { 
  addTask, 
  updateTask, 
  toggleTaskStatus, 
  deleteTask,
  updateTaskOrder,
  resetToSampleData
} = tasksSlice.actions;

// ----------------------
// Selectors
// ----------------------

/**
 * Select all tasks
 * @param {RootState} state - Redux root state
 * @returns {Task[]} All tasks
 */
export const selectAllTasks = (state: RootState): Task[] => state.tasks.tasks;

/**
 * Select a task by ID
 * @param {number} id - Task ID to find
 * @returns {Function} Selector function that returns task or undefined
 */
export const selectTaskById = (id: number) => (state: RootState): Task | undefined => 
  state.tasks.tasks.find(task => task.id === id);

/**
 * Select tasks by status
 * @param {string} status - Status to filter by ('pending' or 'completed')
 * @returns {Function} Selector function that returns filtered tasks
 */
export const selectTasksByStatus = (status: 'pending' | 'completed') => (state: RootState): Task[] =>
  state.tasks.tasks.filter(task => task.status === status);

/**
 * Select tasks by category
 * @param {TaskCategory} category - Category to filter by
 * @returns {Function} Selector function that returns filtered tasks
 */
export const selectTasksByCategory = (category: TaskCategory) => (state: RootState): Task[] =>
  state.tasks.tasks.filter(task => task.category === category);

/**
 * Select tasks by priority
 * @param {TaskPriority} priority - Priority to filter by
 * @returns {Function} Selector function that returns filtered tasks
 */
export const selectTasksByPriority = (priority: TaskPriority) => (state: RootState): Task[] =>
  state.tasks.tasks.filter(task => task.priority === priority);

/**
 * Select tasks by search term
 * @param {string} searchTerm - Search term to filter by
 * @returns {Function} Selector function that returns filtered tasks
 */
export const selectTasksBySearchTerm = (searchTerm: string) => (state: RootState): Task[] => {
  if (!searchTerm.trim()) return state.tasks.tasks;
  
  const term = searchTerm.toLowerCase();
  return state.tasks.tasks.filter(task => 
    task.title.toLowerCase().includes(term)
  );
};

/**
 * Select tasks sorted by deadline
 * Uses createSelector for memoization of sorted results
 */
export const selectTasksSortedByDeadline = createSelector(
  [selectAllTasks],
  (tasks): Task[] => [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
);

/**
 * Select tasks sorted by priority
 * Uses createSelector for memoization of sorted results
 */
export const selectTasksSortedByPriority = createSelector(
  [selectAllTasks],
  (tasks): Task[] => {
    const priorityValue = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => priorityValue[a.priority] - priorityValue[b.priority]);
  }
);

/**
 * Select tasks sorted by any field in ascending or descending order
 * @param {keyof Task} field - Field to sort by
 * @param {'asc'|'desc'} direction - Sort direction
 * @returns {Function} Selector function that returns sorted tasks
 */
export const selectTasksSortedByField = (
  field: keyof Task, 
  direction: 'asc' | 'desc' = 'asc'
) => createSelector(
  [selectAllTasks],
  (tasks): Task[] => {
    return [...tasks].sort((a, b) => {
      if (field === 'deadline') {
        const dateA = new Date(a[field]).getTime();
        const dateB = new Date(b[field]).getTime();
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (field === 'priority') {
        const priorityValue = { high: 0, medium: 1, low: 2 };
        const valueA = priorityValue[a.priority];
        const valueB = priorityValue[b.priority];
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        const valueA = String(a[field]).toLowerCase();
        const valueB = String(b[field]).toLowerCase();
        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }
);

/**
 * Task statistics interface
 */
interface TaskStatistics {
  /** Total number of tasks */
  totalTasks: number;
  /** Number of completed tasks */
  completedTasks: number;
  /** Number of pending tasks */
  pendingTasks: number;
  /** Completion rate as percentage */
  completionRate: number;
  /** Count of tasks by category */
  categoryCounts: Record<string, number>;
  /** Count of tasks by priority */
  priorityCounts: Record<string, number>;
  /** Number of overdue tasks */
  overdueCount: number;
  /** Number of tasks due within 7 days */
  upcomingCount: number;
}

/**
 * Select task statistics for dashboard
 * Uses createSelector for memoization of calculated results
 */
export const selectTaskStatistics = createSelector(
  [selectAllTasks],
  (tasks): TaskStatistics => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    
    // Category stats
    const categoryCounts = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Priority stats
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Deadline stats
    const today = new Date();
    const overdueCount = tasks.filter(task => {
      return task.status === 'pending' && new Date(task.deadline) < today;
    }).length;
    
    const upcomingCount = tasks.filter(task => {
      const deadline = new Date(task.deadline);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return task.status === 'pending' && diffDays >= 0 && diffDays <= 7;
    }).length;
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      categoryCounts,
      priorityCounts,
      overdueCount,
      upcomingCount
    };
  }
);

export default tasksSlice.reducer;
