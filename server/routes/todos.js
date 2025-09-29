const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all todos (user's or all if admin)
router.get('/', auth, async (req, res) => {
  try {
    let todos;
    if (req.query.all === 'true' && req.user.role === 'admin') {
      todos = await Todo.find().populate('user', 'username');
    } else {
      todos = await Todo.find({ user: req.user.id });
    }
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a todo
router.post('/', auth, async (req, res) => {
  const todo = new Todo({
    task: req.body.task,
    user: req.user.id,
  });
  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);

    // Emit to socket
    const io = req.app.get('io');
    const populatedTodo = await Todo.findById(newTodo._id).populate('user', 'username');

    io.to(`user_${req.user.id}`).emit('todoCreated', newTodo);
    io.to('admins').emit('todoCreated', populatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a todo
router.put('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }
    const updatedTodo = await Todo.findOneAndUpdate(filter, req.body, { new: true });
    if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
    res.json(updatedTodo);

    // Emit to socket
    const io = req.app.get('io');
    const populatedTodo = await Todo.findById(updatedTodo._id).populate('user', 'username');
    const ownerId = updatedTodo.user.toString();

    io.to(`user_${ownerId}`).emit('todoUpdated', updatedTodo);
    io.to('admins').emit('todoUpdated', populatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }
    const todo = await Todo.findOneAndDelete(filter);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo deleted' });

    // Emit to socket
    const io = req.app.get('io');
    const ownerId = todo.user.toString();

    io.to(`user_${ownerId}`).emit('todoDeleted', req.params.id);
    io.to('admins').emit('todoDeleted', req.params.id);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;