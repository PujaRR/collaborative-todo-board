import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBoard } from '../store/boardSlice';
import { toast } from 'react-toastify';

const CreateBoard = () => {
  const [title, setTitle] = useState('');
  const dispatch = useDispatch();

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Board title is required');
      return;
    }
    try {
      await dispatch(createBoard(title)).unwrap();
      setTitle('');
      toast.success('Board created successfully');
    } catch (error) {
      toast.error(`Failed to create board: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Create New Board</h3>
      <form onSubmit={handleCreateBoard} className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Board Title"
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateBoard;