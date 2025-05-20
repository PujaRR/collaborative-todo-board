import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import CreateTask from './CreateTask';
import DeleteList from './DeleteList';

export const List = ({ list, listIndex, boardId }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'In Progress':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'Done':
        return 'bg-green-100 dark:bg-green-900';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'To Do':
        return '📋';
      case 'In Progress':
        return '⏳';
      case 'Done':
        return '✅';
      default:
        return '';
    }
  };

  return (
    <div className={`w-80 rounded-lg shadow-md p-4 ${getStatusColor(list.status)} relative`}>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
        {getStatusIcon(list.status)} {list.title}
      </h2>
      <DeleteList boardId={boardId} listIndex={listIndex} />
      <Droppable droppableId={`${boardId}-${listIndex}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[100px] p-2 rounded-lg transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-gray-700'
            }`}
          >
            {list.tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                boardId={boardId}
                listIndex={listIndex}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <CreateTask boardId={boardId} listIndex={listIndex} />
    </div>
  );
};