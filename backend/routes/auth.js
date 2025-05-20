const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sanitize = require('sanitize-html');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sanitizedUsername = sanitize(username.trim());
  const sanitizedEmail = sanitize(email.trim());

  if (!/^\S+@\S+\.\S+$/.test(sanitizedEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (sanitizedUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email: sanitizedEmail }, { username: sanitizedUsername }] });
    if (existingUser) {
      if (existingUser.email === sanitizedEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      if (existingUser.username === sanitizedUsername) {
        return res.status(409).json({ error: 'Username already exists' });
      }
    }

    const newUser = new User({ username: sanitizedUsername, email: sanitizedEmail, password });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: `Failed to register: ${err.message}` });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const sanitizedEmail = sanitize(email.trim());
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: `Failed to login: ${error.message}` });
  }
});

module.exports = router;