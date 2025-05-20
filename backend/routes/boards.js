const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Board = require('../models/Board');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { getIO, emitToUsers, emitToBoardMembers } = require('../socket');

// Get all boards for the authenticated user (owned or shared)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ user: req.user.userId }, { sharedWith: req.user.userId }],
    }).populate('sharedWith', 'email');
    res.json(boards);
  } catch (error) {
    console.error('Fetch boards error:', error);
    res.status(500).json({ error: `Failed to fetch boards: ${error.message}` });
  }
});

// Get board by ID
router.get('/:boardId', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.boardId,
      $or: [{ user: req.user.userId }, { sharedWith: req.user.userId }],
    }).populate('sharedWith', 'email');
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (error) {
    console.error('Fetch board error:', error);
    res.status(500).json({ error: `Failed to fetch board: ${error.message}` });
  }
});

// Create a new board with default Kanban lists
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const existingBoard = await Board.findOne({ title, user: req.user.userId });
    if (existingBoard) {
      return res.status(400).json({ error: 'Board with this title already exists for this user' });
    }

    const board = new Board({
      title,
      lists: [
        { title: 'To Do', status: 'To Do', tasks: [] },
        { title: 'In Progress', status: 'In Progress', tasks: [] },
        { title: 'Done', status: 'Done', tasks: [] },
      ],
      user: req.user.userId,
      sharedWith: [],
    });
    await board.save();
    emitToBoardMembers(board._id, 'boardUpdated', board);
    res.status(201).json(board);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: `Failed to create board: ${error.message}` });
  }
});

// Delete a board
router.delete('/:boardId', authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findOne({ _id: boardId, user: req.user.userId });
    if (!board) return res.status(404).json({ error: 'Board not found or you are not the owner' });
    await Board.deleteOne({ _id: boardId });
    getIO().emit('boardDeleted', boardId);
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: `Failed to delete board: ${error.message}` });
  }
});

// Share a board with another user
router.post('/:boardId/share', authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    if (!mongoose.isValidObjectId(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    const board = await Board.findOne({ _id: boardId, user: req.user.userId });
    if (!board) {
      return res.status(404).json({ error: 'Board not found or you are not the owner' });
    }

    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (board.user.toString() === userToShare._id.toString()) {
      return res.status(400).json({ error: 'Cannot share board with yourself' });
    }

    if (board.sharedWith.includes(userToShare._id)) {
      return res.status(400).json({ error: 'Board already shared with this user' });
    }

    board.sharedWith.push(userToShare._id);
    await board.save();
    emitToBoardMembers(boardId, 'boardUpdated', board);
    emitToUsers([userToShare._id], 'boardShared', board);
    res.json(board);
  } catch (error) {
    console.error('Share board error:', error);
    res.status(500).json({ error: `Failed to share board: ${error.message}` });
  }
});

// Create a new list in a board
router.post('/:boardId/lists', authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, status } = req.body;
    if (!title || !status) return res.status(400).json({ error: 'Title and status are required' });
    if (!['To Do', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const board = await Board.findOne({
      _id: boardId,
      $or: [{ user: req.user.userId }, { sharedWith: req.user.userId }],
    });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    board.lists.push({ title, status, tasks: [] });
    await board.save();
    emitToBoardMembers(boardId, 'boardUpdated', board);
    res.status(201).json(board);
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: `Failed to create list: ${error.message}` });
  }
});

// Delete a list in a board
router.delete('/:boardId/lists/:listIndex', authMiddleware, async (req, res) => {
  try {
    const { boardId, listIndex } = req.params;
    const board = await Board.findOne({
      _id: boardId,
      $or: [{ user: req.user.userId }, { sharedWith: req.user.userId }],
    });
    if (!board || listIndex >= board.lists.length) {
      return res.status(404).json({ error: 'Board or list not found' });
    }
    board.lists.splice(listIndex, 1);
    await board.save();
    emitToBoardMembers(boardId, 'boardUpdated', board);
    res.json(board);
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: `Failed to delete list: ${error.message}` });
  }
});

// Add a task to a list
router.post('/:boardId/lists/:listIndex/tasks', authMiddleware, async (req, res) => {
  try {
    const { boardId, listIndex } = req.params;
    const { title, description, dueDate, priority, assignee } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const board = await Board.findOne({
      _id: boardId,
      $or: [{ user: req.user.userId }, { sharedWith: req.user.userId }],
    });
    if (!board || listIndex >= board.lists.length) {
      return res.status(404).json({ error: 'Board or list not found' });
    }
    if (assignee && !mongoose.isValidObjectId(assignee)) {
      return res.status(400).json({ error: 'Invalid assignee ID' });
    }
    if (assignee && !board.sharedWith.includes(assignee) && board.user.toString() !== assignee) {
      return res.status(403).json({ error: 'Assignee must be a board member' });
    }
    board.lists[listIndex].tasks.push({
      title,
      description,
      status: board.lists[listIndex].status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'Medium',
      assignee,
    });
    await board.save();
    emitToBoardMembers(boardId, 'boardUpdated', board);
    res.status(201).json(board);
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ error: `Failed to add task: ${error.message}` });
  }
});

// Edit a task
router.patch('/:boardId/lists/:listIndex/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const { boardId, listIndex, taskId } = req.params;
    const { title, description, dueDate, priority, assignee } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const board = await Board.findOne({
      _id: boardId,
      $or: [{ user: req.user.userId }, { sharedWith: req.user.userId }],
    });
    if (!board || listIndex >= board.lists.length) {
      return res.status(404).json({ error: 'Board or list not found' });
    }
    const task = board.lists[listIndex].tasks.find((t) => t._id.toString() === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (assignee && !mongoose.isValidObjectId(assignee)) {
      return res.status(400).json({ error: 'Invalid assignee ID' });
    }
    if (assignee && !board.sharedWith.includes(assignee) && board.user.toString() !== assignee) {
      return res.status(403).json({ error: 'Assignee must be a board member' });
    }
    task.title = title;
    task.description = description;
    task.dueDate = dueDate ? new Date(dueDate) : undefined;
    task.priority = priority || task.priority;
    task.assignee = assignee || task.assignee;
    task.status = board.lists[listIndex].status;
    await board.save();
    emitToBoardMembers(boardId, 'boardUpdated', board);
    res.json(board);
  } catch (error) {
    console.error('Edit task error:', error);
    res.status(500).json({ error: `Failed to edit task: ${error.message}` });
  }
});

// Delete a task
router.delete('/:boardId/lists/:listIndex/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const { boardId, listIndex, taskId } = req.params;
    const board = await Board.findOne({
      _id: boardId,
      $or: [{ user: req.user.userId }, { sharedWith: req.user.userId }],
    });
    if (!board || listIndex >= board.lists.length) {
      return res.status(404).json({ error: 'Board or list not found' });
    }
    board.lists[listIndex].tasks = board.lists[listIndex].tasks.filter(
      (t) => t._id.toString() !== taskId
    );
    await board.save();
    emitToBoardMembers(boardId, 'boardUpdated', board);
    res.json(board);
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: `Failed to delete task: ${error.message}` });
  }
});

// Move a task within or between lists
router.patch('/:boardId/move-task', authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { taskId, sourceListIndex, destinationListIndex, sourceIndex, destinationIndex } = req.body;

    if (!mongoose.isValidObjectId(boardId) || !mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({ error: 'Invalid board or task ID' });
    }
    if (
      !Number.isInteger(sourceListIndex) ||
      !Number.isInteger(destinationListIndex) ||
      !Number.isInteger(sourceIndex) ||
      !Number.isInteger(destinationIndex) ||
      sourceListIndex < 0 ||
      destinationListIndex < 0 ||
      sourceIndex < 0 ||
      destinationIndex < 0
    ) {
      return res.status(400).json({ error: 'Invalid list or task index' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const board = await Board.findOne({
        _id: boardId,
        $or: [{ user: req.user.userId }, { sharedWith: req.user.userId }],
      }).session(session);
      if (!board || sourceListIndex >= board.lists.length || destinationListIndex >= board.lists.length) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Board or list not found' });
      }
      if (sourceIndex >= board.lists[sourceListIndex].tasks.length || destinationIndex > board.lists[destinationListIndex].tasks.length) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'Invalid task index' });
      }

      const task = board.lists[sourceListIndex].tasks.id(taskId);
      if (!task) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Task not found' });
      }

      // Prevent direct To Do to Done movement
      if (board.lists[sourceListIndex].status === 'To Do' && board.lists[destinationListIndex].status === 'Done') {
        await session.abortTransaction();
        return res.status(400).json({ error: 'Cannot move task directly from To Do to Done' });
      }

      task.status = board.lists[destinationListIndex].status;
      board.lists[sourceListIndex].tasks.pull({ _id: taskId });
      board.lists[destinationListIndex].tasks.splice(destinationIndex, 0, task);
      await board.save({ session });
      await session.commitTransaction();

      emitToBoardMembers(boardId, 'boardUpdated', board);
      res.json(board);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ error: `Failed to move task: ${error.message}` });
  }
});

module.exports = router;