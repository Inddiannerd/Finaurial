const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.ATLAS_URI, options);
    console.log('MongoDB connected successfully');
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('Database ping successful');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (err.message.includes('IP address')) {
      console.error('\nIMPORTANT: Your IP address is not whitelisted on MongoDB Atlas.');
      console.error('Please follow these steps:');
      console.error('1. Go to MongoDB Atlas dashboard');
      console.error('2. Click on Network Access in the left sidebar');
      console.error('3. Click "Add IP Address"');
      console.error('4. Click "Allow Access from Anywhere" or add your specific IP\n');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
