import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext'; // Import useNotification

const RegisterForm = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification(); // Use the hook
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Client-side validation
    if (!username || !email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Password validation
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
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-center text-2xl font-bold mb-6">Register</h2>
      {/* Removed local error display as notifications handle it */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="Username" 
          required 
          className="w-full p-2 border rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}  
        />
        <input 
          type="email" 
          placeholder="Email" 
          required 
          className="w-full p-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}  
        />
        <input 
          type="password" 
          placeholder="Password" 
          required
          className="w-full p-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}  
        />
        <button type="submit" className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700">Register</button>
      </form>
      <p className="mt-4 text-center">Already have an account? <Link to="/login" className="text-green-600">Log In</Link></p>
    </div>
  );
};

export default RegisterForm;
