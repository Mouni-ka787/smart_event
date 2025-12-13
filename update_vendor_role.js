// Script to update a user's role to vendor
const mongoose = require('mongoose');
require('dotenv').config();

// User model schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  phoneNumber: String,
  address: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Connect to database
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx')
  .then(async () => {
    console.log('Connected to database');
    
    // Update user role to vendor
    // Replace 'user@example.com' with the email of the user you want to make a vendor
    const userEmail = 'user@example.com';
    
    try {
      const user = await User.findOne({ email: userEmail });
      
      if (!user) {
        console.log('User not found');
        process.exit(1);
      }
      
      console.log('Current user role:', user.role);
      
      // Update role to vendor
      user.role = 'vendor';
      await user.save();
      
      console.log('User role updated to vendor successfully');
      console.log('Updated user:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
      
      process.exit(0);
    } catch (error) {
      console.error('Error updating user role:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });