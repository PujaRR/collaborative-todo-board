import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './boardSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    board: boardReducer,
    auth: authReducer,
  },
});

export default store;