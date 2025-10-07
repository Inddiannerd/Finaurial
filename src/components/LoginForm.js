import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import Card from './Card';

const LoginForm = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      showNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showNotification(err.response?.data?.msg || 'Login failed', 'error');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to Finaurial</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2"
            placeholder="Enter your password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full btn btn-primary"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-green hover:underline">
          Register here
        </Link>
      </p>
    </Card>
  );
};

export default LoginForm;