import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px', textAlign: 'center' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          📋 Welcome to Collaborative To-Do Board
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '16px auto' }}>
          Organize your tasks, collaborate with others in real-time, and boost productivity with our Trello-like board.
        </p>
      </header>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <Link
          to="/login"
          style={{
            background: 'var(--accent-primary)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Login
        </Link>
        <Link
          to="/register"
          style={{
            background: 'var(--accent-success)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;