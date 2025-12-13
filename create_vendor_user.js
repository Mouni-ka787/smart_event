// Script to create a new vendor user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Connect to database
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx')
  .then(async () => {
    console.log('Connected to database');
    
    // Vendor user details
    const vendorData = {
      name: 'Vendor Name',
      email: 'vendor@example.com',
      password: 'vendor123',
      role: 'vendor',
      phoneNumber: '+1234567890'
    };
    
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: vendorData.email });
      
      if (existingUser) {
        console.log('User already exists with this email');
        console.log('User details:', {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role
        });
        
        // If user exists but is not a vendor, update the role
        if (existingUser.role !== 'vendor') {
          console.log('Updating user role to vendor...');
          existingUser.role = 'vendor';
          await existingUser.save();
          console.log('User role updated to vendor successfully');
        }
        
        process.exit(0);
      }
      
      // Create new vendor user
      const newUser = new User(vendorData);
      await newUser.save();
      
      console.log('Vendor user created successfully');
      console.log('User details:', {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });
      
      process.exit(0);
    } catch (error) {
      console.error('Error creating vendor user:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });