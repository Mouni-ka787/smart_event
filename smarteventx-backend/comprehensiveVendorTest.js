const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./dist/models/User');
const Service = require('./dist/models/Service');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const comprehensiveVendorTest = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Get all users
    const users = await User.find({});
    console.log('\n=== All Users ===');
    console.log('Total users:', users.length);
    
    // Get all vendors
    const vendors = await User.find({ role: 'vendor' });
    console.log('\n=== Vendor Accounts ===');
    console.log('Total vendors:', vendors.length);
    
    if (vendors.length === 0) {
      console.log('No vendors found in the database.');
    } else {
      for (const vendor of vendors) {
        console.log(`\nVendor: ${vendor.name} (${vendor.email})`);
        console.log(`  ID: ${vendor._id}`);
        console.log(`  Role: ${vendor.role}`);
        
        // Check services for this vendor
        const services = await Service.find({ vendor: vendor._id });
        console.log(`  Services: ${services.length}`);
        
        if (services.length > 0) {
          services.forEach((service, index) => {
            console.log(`    Service ${index + 1}: ${service.name}`);
          });
        }
        
        // Create a JWT token for this vendor
        const token = jwt.sign({ userId: vendor._id }, process.env.JWT_SECRET || 'fallback_secret');
        console.log(`  Sample JWT Token: Bearer ${token}`);
      }
    }
    
    // Test authentication with one vendor
    if (vendors.length > 0) {
      const testVendor = vendors[0];
      console.log('\n=== Testing Authentication ===');
      console.log(`Testing with vendor: ${testVendor.name} (${testVendor.email})`);
      
      // Create token
      const token = jwt.sign({ userId: testVendor._id }, process.env.JWT_SECRET || 'fallback_secret');
      console.log(`Token: Bearer ${token}`);
      
      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      console.log('Decoded token:', decoded);
      
      // Look up user
      const user = await User.findById(decoded.userId).select('-password');
      console.log('User found:', user);
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

comprehensiveVendorTest();