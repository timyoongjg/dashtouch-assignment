import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './features/tasks/tasksSlice';

/**
 * Redux store configuration
 * 
 * The central store that holds the complete state tree of the application.
 * It combines all reducers and applies middleware for the Redux store.
 */
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
});

/**
 * Type representing the root state structure
 * 
 * This type is inferred from the store's state, which combines all slice reducers.
 * It should be used when accessing the state in selectors and components.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Type representing the dispatch function
 * 
 * This type includes all action creators that can be dispatched to the store,
 * including those from Redux Toolkit's createAsyncThunk.
 */
export type AppDispatch = typeof store.dispatch;
