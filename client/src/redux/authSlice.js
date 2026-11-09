// client/src/redux/authSlice.js
// Redux Toolkit slice for authentication and user session management

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Retrieve initial session from localStorage
const storedToken = localStorage.getItem('aiesec_token') || null;
const storedUser = localStorage.getItem('aiesec_user')
  ? JSON.parse(localStorage.getItem('aiesec_user'))
  : null;

const initialState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!(storedToken && storedUser),
  loading: false,
  error: null
};

// Async Thunk: Register a new account
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('aiesec_token', token);
        localStorage.setItem('aiesec_user', JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue(response.data.message || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration error';
      return rejectWithValue(msg);
    }
  }
);

// Async Thunk: Login user
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('aiesec_token', token);
        localStorage.setItem('aiesec_user', JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue(response.data.message || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      return rejectWithValue(msg);
    }
  }
);

// Async Thunk: Verify active token on application load
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('aiesec_token');
    if (!token) return null;
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.user) {
        localStorage.setItem('aiesec_user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return rejectWithValue('Session expired');
    } catch (err) {
      localStorage.removeItem('aiesec_token');
      localStorage.removeItem('aiesec_user');
      return rejectWithValue('Invalid or expired token');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('aiesec_token');
      localStorage.removeItem('aiesec_user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

