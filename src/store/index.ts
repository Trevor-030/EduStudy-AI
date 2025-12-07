import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import progressReducer from './progressSlice';
import { saveProgressToStorage, loadProgressFromStorage } from '../utils/progressStorage';
import { loadProgress } from './progressSlice';

// Load initial progress from localStorage
const initialProgress = loadProgressFromStorage();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    progress: progressReducer,
  },
});

// Load progress from localStorage if available
if (initialProgress) {
  store.dispatch(loadProgress(initialProgress));
}

// Add listener to save progress to localStorage on state changes
store.subscribe(() => {
  const state = store.getState();
  saveProgressToStorage(state.progress);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;