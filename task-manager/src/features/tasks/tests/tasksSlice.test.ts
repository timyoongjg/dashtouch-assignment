import tasksReducer, {
  addTask,
  updateTask,
  toggleTaskStatus,
  selectAllTasks,
  selectTasksByStatus,
  selectTasksSortedByDeadline
} from '../tasksSlice';
import { configureStore } from '@reduxjs/toolkit';
import { RootState } from '../../../store';

describe('Tasks Slice', () => {
  const initialState = {
    tasks: [
      { id: 1, title: "Fix login bug", status: "pending" as const, deadline: "2025-05-10", category: "work" as const, priority: "medium" as const },
      { id: 2, title: "Write unit tests", status: "completed" as const, deadline: "2025-06-01", category: "work" as const, priority: "medium" as const }
    ],
    nextId: 3,
    deletedIds: []
  };

  it('should handle initial state', () => {
    const state = tasksReducer(undefined, { type: 'unknown' });
    expect(state.tasks.length).toBeGreaterThan(0);
    expect(state.nextId).toBeDefined();
  });

  it('should handle addTask', () => {
    const newTask = {
      title: "New task",
      status: "pending" as const,
      deadline: "2025-07-15",
      category: "work" as const,
      priority: "medium" as const
    };
    
    const state = tasksReducer(initialState, addTask(newTask));
    
    expect(state.tasks.length).toBe(3);
    expect(state.tasks[2].id).toBe(3);
    expect(state.tasks[2].title).toBe("New task");
    expect(state.nextId).toBe(4);
  });

  it('should handle updateTask', () => {
    const updatedTask = {
      id: 1,
      title: "Fixed login bug"
    };
    
    const state = tasksReducer(initialState, updateTask(updatedTask));
    
    expect(state.tasks[0].title).toBe("Fixed login bug");
    // Other properties should remain the same
    expect(state.tasks[0].status).toBe("pending");
  });

  it('should handle toggleTaskStatus', () => {
    const state = tasksReducer(initialState, toggleTaskStatus(1));
    
    expect(state.tasks[0].status).toBe("completed");
    
    const newState = tasksReducer(state, toggleTaskStatus(1));
    expect(newState.tasks[0].status).toBe("pending");
  });

  describe('selectors', () => {
    let store: ReturnType<typeof configureStore>;
    let state: RootState;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          tasks: tasksReducer
        }
      });
      state = store.getState() as RootState;
    });

    it('should select all tasks', () => {
      const tasks = selectAllTasks(state);
      expect(tasks.length).toBe(state.tasks.tasks.length);
    });

    it('should select tasks by status', () => {
      const pendingTasks = selectTasksByStatus('pending')(state);
      expect(pendingTasks.length).toBe(5);
      
      const completedTasks = selectTasksByStatus('completed')(state);
      expect(completedTasks.length).toBe(2);
    });

    it('should select tasks sorted by deadline', () => {
      const sortedTasks = selectTasksSortedByDeadline(state);
      
      for (let i = 0; i < sortedTasks.length - 1; i++) {
        const currentDate = new Date(sortedTasks[i].deadline);
        const nextDate = new Date(sortedTasks[i + 1].deadline);
        expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
      }
    });
  });
}); 