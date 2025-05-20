import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { shareBoard, fetchBoard } from '../store/boardSlice';
import { toast } from 'react-toastify';

const ShareBoard = ({ boardId }) => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const handleShareBoard = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!boardId) {
      toast.error('Invalid board ID');
      return;
    }
    try {
      await dispatch(shareBoard({ boardId, email: email.trim() })).unwrap();
      setEmail('');
      toast.success('Board shared successfully');
      dispatch(fetchBoard(boardId));
    } catch (error) {
      const errorMessage = error.message || 'Failed to share board. User may not exist or board already shared.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Share Board</h3>
      <form onSubmit={handleShareBoard} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="User Email"
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition"
        >
          Share
        </button>
      </form>
    </div>
  );
};

export default ShareBoard;