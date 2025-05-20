import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchBoard } from '../store/boardSlice';
import { toast } from 'react-toastify';
import api from '../api';

const DeleteList = ({ boardId, listIndex }) => {
  const dispatch = useDispatch();

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    try {
      await api.delete(`/boards/${boardId}/lists/${listIndex}`);
      dispatch(fetchBoard(boardId));
      toast.success('List deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete list: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  return (
    <button
      onClick={handleDeleteList}
      className="bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition absolute top-2 right-2"
    >
      Delete List
    </button>
  );
};

export default DeleteList;