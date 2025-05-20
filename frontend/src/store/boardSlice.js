import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchBoards = createAsyncThunk('board/fetchBoards', async () => {
  const response = await api.get('/boards');
  return response.data;
});

export const fetchBoard = createAsyncThunk('board/fetchBoard', async (boardId) => {
  const response = await api.get(`/boards/${boardId}`);
  return response.data;
});

export const createBoard = createAsyncThunk('board/createBoard', async (title) => {
  const response = await api.post('/boards', { title });
  return response.data;
});

export const deleteBoard = createAsyncThunk('board/deleteBoard', async (boardId) => {
  await api.delete(`/boards/${boardId}`);
  return boardId;
});

export const shareBoard = createAsyncThunk('board/shareBoard', async ({ boardId, email }) => {
  try {
    const response = await api.post(`/boards/${boardId}/share`, { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to share board');
  }
});

export const createTask = createAsyncThunk(
  'board/createTask',
  async ({ boardId, listIndex, title, description, dueDate, priority, assignee }) => {
    const response = await api.post(`/boards/${boardId}/lists/${listIndex}/tasks`, {
      title,
      description,
      dueDate,
      priority,
      assignee,
    });
    return response.data;
  }
);

export const editTask = createAsyncThunk(
  'board/editTask',
  async ({ boardId, listIndex, taskId, title, description, dueDate, priority, assignee }) => {
    const response = await api.patch(`/boards/${boardId}/lists/${listIndex}/tasks/${taskId}`, {
      title,
      description,
      dueDate,
      priority,
      assignee,
    });
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'board/deleteTask',
  async ({ boardId, listIndex, taskId }) => {
    const response = await api.delete(`/boards/${boardId}/lists/${listIndex}/tasks/${taskId}`);
    return response.data;
  }
);

export const moveTask = createAsyncThunk(
  'board/moveTask',
  async ({ boardId, taskId, sourceListIndex, destinationListIndex, sourceIndex, destinationIndex }) => {
    try {
      const response = await api.patch(`/boards/${boardId}/move-task`, {
        taskId,
        sourceListIndex,
        destinationListIndex,
        sourceIndex,
        destinationIndex,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to move task');
    }
  }
);

export const createList = createAsyncThunk(
  'board/createList',
  async ({ boardId, title, status }) => {
    const response = await api.post(`/boards/${boardId}/lists`, { title, status });
    return response.data;
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    boards: [],
    activeBoardId: null,
    activeBoard: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setActiveBoard: (state, action) => {
      state.activeBoardId = action.payload;
      state.activeBoard = state.boards.find((board) => board._id === action.payload) || null;
    },
    updateBoard: (state, action) => {
      const updatedBoard = action.payload;
      state.boards = state.boards.map((board) =>
        board._id === updatedBoard._id ? updatedBoard : board
      );
      if (state.activeBoardId === updatedBoard._id) {
        state.activeBoard = updatedBoard;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch boards';
      })
      .addCase(fetchBoard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activeBoard = action.payload;
        state.activeBoardId = action.payload._id;
        if (!state.boards.find((board) => board._id === action.payload._id)) {
          state.boards.push(action.payload);
        }
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch board';
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
        state.activeBoardId = action.payload._id;
        state.activeBoard = action.payload;
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create board';
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter((board) => board._id !== action.payload);
        if (state.activeBoardId === action.payload) {
          state.activeBoardId = null;
          state.activeBoard = null;
        }
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete board';
      })
      .addCase(shareBoard.fulfilled, (state, action) => {
        const updatedBoard = action.payload;
        state.boards = state.boards.map((board) =>
          board._id === updatedBoard._id ? updatedBoard : board
        );
        if (state.activeBoardId === updatedBoard._id) {
          state.activeBoard = updatedBoard;
        }
      })
      .addCase(shareBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to share board';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.activeBoard = action.payload;
        const updatedBoard = action.payload;
        state.boards = state.boards.map((board) =>
          board._id === updatedBoard._id ? updatedBoard : board
        );
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create task';
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.activeBoard = action.payload;
      })
      .addCase(editTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to edit task';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.activeBoard = action.payload;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete task';
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.activeBoard = action.payload;
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to move task';
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.activeBoard = action.payload;
        if (!state.boards.find((board) => board._id === action.payload._id)) {
          state.boards.push(action.payload);
        }
      })
      .addCase(createList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to create list';
      });
  },
});

export const { setActiveBoard, updateBoard } = boardSlice.actions;
export default boardSlice.reducer;