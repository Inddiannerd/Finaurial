import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { username, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-center text-2xl font-bold mb-6">Register</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
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
