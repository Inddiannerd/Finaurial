import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import Card from './Card';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
      if (response.data.token) {
        showNotification('Registration successful!', 'success');
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      } else {
        showNotification('Registration successful! Please log in.', 'success');
        navigate('/login');
      }
    } catch (err) {
      showNotification(err.response?.data?.msg || 'Registration failed', 'error');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Username</label>
          <input 
            type="text" 
            placeholder="Enter your username" 
            required 
            className="w-full p-2"
            value={username}
            onChange={e => setUsername(e.target.value)}  
          />
        </div>
        <div>
          <label className="block mb-2">Email</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            required 
            className="w-full p-2"
            value={email}
            onChange={e => setEmail(e.target.value)}  
          />
        </div>
        <div>
          <label className="block mb-2">Password</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            required
            className="w-full p-2"
            value={password}
            onChange={e => setPassword(e.target.value)}  
          />
        </div>
        <button type="submit" className="w-full btn btn-primary">Register</button>
      </form>
      <p className="mt-4 text-center">Already have an account? <Link to="/login" className="text-brand-green hover:underline">Log In</Link></p>
    </Card>
  );
};

export default RegisterForm;
