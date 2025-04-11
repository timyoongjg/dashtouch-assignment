import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Custom hook to dispatch actions with proper TypeScript typing
 * 
 * This hook is a typed version of the `useDispatch` hook from react-redux.
 * It provides type information for the dispatch function based on the
 * application's Redux store configuration.
 * 
 * @returns {AppDispatch} Typed dispatch function for dispatching actions
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

/**
 * Custom hook to access the Redux store state with proper TypeScript typing
 * 
 * This hook is a typed version of the `useSelector` hook from react-redux.
 * It ensures that the selector function receives the correctly typed state
 * object and provides proper type inference for the selected value.
 * 
 * @template TSelected The type of the selected value
 * @param {Function} selector - A function that extracts values from the state
 * @returns {TSelected} The selected portion of the state
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 