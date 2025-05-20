import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoards, setActiveBoard, fetchBoard, updateBoard, moveTask, deleteBoard } from './store/boardSlice';
import { logout } from './store/authSlice';
import { DragDropContext } from 'react-beautiful-dnd';
import io from 'socket.io-client';
import jwtDecode from 'jwt-decode';
import { List } from './components/List';
import CreateBoard from './components/CreateBoard';
import ShareBoard from './components/ShareBoard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000', { autoConnect: false });

const App = () => {
  const dispatch = useDispatch();
  const boards = useSelector((state) => state.board.boards);
  const activeBoard = useSelector((state) => state.board.activeBoard);
  const activeBoardId = useSelector((state) => state.board.activeBoardId);
  const status = useSelector((state) => state.board.status);
  const error = useSelector((state) => state.board.error);
  const token = useSelector((state) => state.auth.token);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          dispatch(logout());
          toast.error('Session expired. Please log in again.');
          return;
        }
        socket.auth = { token };
        socket.connect();
        socket.emit('join', decoded.userId);
        if (activeBoardId) {
          socket.emit('joinBoard', activeBoardId);
        }

        dispatch(fetchBoards()).unwrap().then((fetchedBoards) => {
          if (fetchedBoards.length > 0 && !activeBoardId) {
            const firstBoardId = fetchedBoards[0]._id;
            dispatch(setActiveBoard(firstBoardId));
            dispatch(fetchBoard(firstBoardId));
            socket.emit('joinBoard', firstBoardId);
          }
        }).catch((err) => {
          toast.error('Failed to fetch boards: ' + err.message);
        });
      } catch (err) {
        console.error('Token error:', err);
        dispatch(logout());
        toast.error('Invalid token. Please log in again.');
      }
    }

    const handleBoardUpdated = (updatedBoard) => {
      if (updatedBoard._id === activeBoardId) {
        dispatch(updateBoard(updatedBoard));
      }
    };

    const handleBoardDeleted = (boardId) => {
      if (boardId === activeBoardId) {
        dispatch(setActiveBoard(null));
        socket.emit('leaveBoard', boardId);
      }
      dispatch(fetchBoards());
    };

    const handleBoardShared = (board) => {
      dispatch(fetchBoards());
      socket.emit('joinBoard', board._id);
      toast.info(`Board "${board.title}" has been shared with you`);
    };

    socket.on('boardUpdated', handleBoardUpdated);
    socket.on('boardDeleted', handleBoardDeleted);
    socket.on('boardShared', handleBoardShared);

    return () => {
      socket.off('boardUpdated', handleBoardUpdated);
      socket.off('boardDeleted', handleBoardDeleted);
      socket.off('boardShared', handleBoardShared);
      socket.disconnect();
    };
  }, [dispatch, activeBoardId, token]);

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const [, sourceListIndex] = source.droppableId.split('-').map((val, idx) => idx === 0 ? val : parseInt(val));
    const [, destinationListIndex] = destination.droppableId.split('-').map((val, idx) => idx === 0 ? val : parseInt(val));

    if (!activeBoard || sourceListIndex >= activeBoard.lists.length || destinationListIndex >= activeBoard.lists.length) {
      toast.error('Invalid list index');
      return;
    }

    if (activeBoard.lists[sourceListIndex].status === 'To Do' && activeBoard.lists[destinationListIndex].status === 'Done') {
      toast.error('Cannot move task directly from To Do to Done');
      return;
    }

    try {
      // Optimistic update
      const updatedBoard = JSON.parse(JSON.stringify(activeBoard));
      const task = updatedBoard.lists[sourceListIndex].tasks[source.index];
      task.status = updatedBoard.lists[destinationListIndex].status;
      updatedBoard.lists[sourceListIndex].tasks.splice(source.index, 1);
      updatedBoard.lists[destinationListIndex].tasks.splice(destination.index, 0, task);
      dispatch(updateBoard(updatedBoard));

      await dispatch(moveTask({
        boardId: activeBoard._id,
        taskId: draggableId,
        sourceListIndex,
        destinationListIndex,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      })).unwrap();
      socket.emit('taskMoved');
      toast.success('Task moved successfully');
    } catch (error) {
      toast.error(`Failed to move task: ${error.message || 'Unknown error'}`);
      dispatch(fetchBoard(activeBoard._id));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    socket.disconnect();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const handleDeleteBoard = async () => {
    try {
      await dispatch(deleteBoard(activeBoardId)).unwrap();
      setShowDeleteModal(false);
      toast.success('Board deleted successfully');
    } catch (error) {
      toast.error('Failed to delete board: ' + error.message);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover />
        {status === 'loading' && (
          <div className="text-center text-gray-600 dark:text-gray-300 text-xl animate-pulse">Loading...</div>
        )}
        {status === 'failed' && (
          <div className="text-center text-red-500 text-xl">Error: {error}</div>
        )}
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">📋 Collaborative Kanban Board</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Streamline your workflow with real-time task management
          </p>
          <div className="absolute top-0 right-0 flex gap-3">
            <button
              onClick={toggleTheme}
              className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all"
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="board-select" className="text-gray-700 dark:text-gray-200 font-medium">
                Select Board:
              </label>
              <select
                id="board-select"
                value={activeBoardId || ''}
                onChange={(e) => {
                  const boardId = e.target.value;
                  if (boardId) {
                    dispatch(setActiveBoard(boardId));
                    dispatch(fetchBoard(boardId));
                    socket.emit('joinBoard', boardId);
                  } else {
                    dispatch(setActiveBoard(null));
                  }
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              >
                <option value="">Select a board</option>
                {boards.map((board) => (
                  <option key={board._id} value={board._id}>
                    {board.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <CreateBoard />
              {activeBoardId && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all"
                >
                  Delete Board
                </button>
              )}
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-6 rounded-xl shadow-xl max-w-md w-full">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Delete Board</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete "{activeBoard.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBoard}
                  className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {activeBoard && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{activeBoard.title}</h2>
              <ShareBoard boardId={activeBoardId} />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              <DragDropContext onDragEnd={onDragEnd}>
                {activeBoard.lists.map((list, index) => (
                  <List
                    key={`${activeBoardId}-${index}`}
                    list={list}
                    listIndex={index}
                    boardId={activeBoardId}
                  />
                ))}
              </DragDropContext>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default App;