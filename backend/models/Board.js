const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], required: true },
  tasks: [taskSchema],
});

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lists: [listSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Board', boardSchema);