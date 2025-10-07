const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars - look for .env in the right location
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Verify environment variables
if (!process.env.ATLAS_URI) {
    console.error('ATLAS_URI is not defined in environment variables');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

console.log('Environment check passed. MongoDB URI exists.');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser
app.use(express.json());

// Enable cors with specific options
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://finaurial.vercel.app' : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/Budgets'));
app.use('/api/savings', require('./routes/savings'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Handle SPA routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Connect to database and initialize
const startServer = async () => {
  try {
    await connectDB();
    const initDB = require('./config/initDB');
    await initDB();
    
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
      console.log('Database initialization completed successfully');
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();