const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./src/models/User').default;

// Load environment variables
require('dotenv').config();

const debugToken = async () => {
  // Replace this with an actual token from your frontend
  const token = process.argv[2];
  
  if (!token) {
    console.log('Please provide a JWT token as an argument');
    console.log('Usage: node debugToken.js <token>');
    process.exit(1);
  }
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Decode the token
    console.log('\n--- Decoding Token ---');
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'fallback_secret');
    console.log('Decoded token:', decoded);
    
    // Look up the user
    console.log('\n--- Looking up User ---');
    const user = await User.findById(decoded.userId).select('-password');
    console.log('User found:', user);
    
    if (user) {
      console.log('User ID:', user._id);
      console.log('User role:', user.role);
      console.log('User name:', user.name);
      console.log('User email:', user.email);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugToken();