import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    return response.data.token;
  } catch (error) {
    console.error('Login error:', error.response?.data);
    return rejectWithValue(error.response?.data?.error || 'Failed to login');
  }
});

export const register = createAsyncThunk('auth/register', async ({ username, email, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
    return response.data.token;
  } catch (error) {
    console.error('Register error:', error.response?.data);
    return rejectWithValue(error.response?.data?.error || 'Failed to register');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
      console.log('User logged out, token cleared');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
        state.error = null;
        localStorage.setItem('token', action.payload);
        console.log('Login successful, token stored');
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('Login failed:', action.payload);
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
        state.error = null;
        localStorage.setItem('token', action.payload);
        console.log('Registration successful, token stored');
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('Registration failed:', action.payload);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;