import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../store/boardSlice';
import { toast } from 'react-toastify';

const CreateTask = ({ boardId, listIndex }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');
  const dispatch = useDispatch();
  const activeBoard = useSelector((state) => state.board.activeBoard);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }
    try {
      await dispatch(
        createTask({
          boardId,
          listIndex,
          title,
          description,
          dueDate,
          priority,
          assignee: assignee || undefined,
        })
      ).unwrap();
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('Medium');
      setAssignee('');
      toast.success('Task created successfully');
    } catch (error) {
      toast.error(`Failed to add task: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleAddTask} className="mt-4 space-y-3">
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
      />
      <textarea
        placeholder="Task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-y"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <select
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
      >
        <option value="">Unassigned</option>
        {activeBoard?.sharedWith.map((user) => (
          <option key={user._id} value={user._id}>{user.email}</option>
        ))}
        <option value={activeBoard?.user}>{activeBoard?.sharedWith.find(u => u._id === activeBoard?.user)?.email || 'Owner'}</option>
      </select>
      <button
        type="submit"
        className="w-full bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition"
      >
        Add Task
      </button>
    </form>
  );
};

export default CreateTask;