import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../store/authSlice';
import { toast } from 'react-toastify';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!trimmedUsername || !trimmedEmail || !password) {
      toast.error('All fields are required');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (trimmedUsername.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    try {
      await dispatch(register({ username: trimmedUsername, email: trimmedEmail, password })).unwrap();
      toast.success('Registration successful');
      setUsername('');
      setEmail('');
      setPassword('');
      navigate('/boards');
    } catch (err) {
      const errorMessage =
        err === 'Email already exists'
          ? 'This email is already registered'
          : err === 'Username already exists'
          ? 'This username is already taken'
          : err || 'Failed to register. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 dark:text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;