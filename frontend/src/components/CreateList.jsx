import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createList, fetchBoard } from '../store/boardSlice';
import { toast } from 'react-toastify';

const CreateList = ({ boardId }) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('To Do');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('List title is required');
      return;
    }
    try {
      await dispatch(createList({ boardId, title, status })).unwrap();
      setTitle('');
      setStatus('To Do');
      dispatch(fetchBoard(boardId));
      toast.success('List created successfully');
    } catch (error) {
      toast.error(`Failed to create list: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Create New List</h3>
      <form onSubmit={handleCreateList} className="flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List Title"
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all"
        >
          Create List
        </button>
      </form>
    </div>
  );
};

export default CreateList;