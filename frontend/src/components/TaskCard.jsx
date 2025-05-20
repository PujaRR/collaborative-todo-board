import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { editTask, deleteTask } from '../store/boardSlice';
import { toast } from 'react-toastify';

const TaskCard = ({ task, index, boardId, listIndex }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [priority, setPriority] = useState(task.priority || 'Medium');
  const [assignee, setAssignee] = useState(task.assignee || '');
  const dispatch = useDispatch();
  const activeBoard = useSelector((state) => state.board.activeBoard);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleEdit = async () => {
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }
    try {
      await dispatch(
        editTask({ boardId, listIndex, taskId: task._id, title, description, dueDate, priority, assignee: assignee || undefined })
      ).unwrap();
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error(`Failed to edit task: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await dispatch(
        deleteTask({ boardId, listIndex, taskId: task._id })
      ).unwrap();
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete task: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 mb-2 relative hover:shadow-md transition"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {isEditing ? (
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-y"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {activeBoard?.sharedWith.map((user) => (
                  <option key={user._id} value={user._id}>{user.email}</option>
                ))}
                <option value={activeBoard?.user}>
                  {activeBoard?.sharedWith.find(u => u._id === activeBoard?.user)?.email || 'Owner'}
                </option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="font-semibold text-gray-800 dark:text-white text-lg">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{task.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white">
                    Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {task.assignee && (
                  <span className="text-xs font-medium px-2 py-1 rounded bg-blue-200 dark:bg-blue-600 text-blue-800 dark:text-white">
                    {activeBoard?.sharedWith.find(u => u._id === task.assignee)?.email || 'Owner'}
                  </span>
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;