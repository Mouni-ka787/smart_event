// Test script to check vendor services
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/smarteventx";

// User/Vendor schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

// Service schema (simplified)
const serviceSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  price: Number,
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);

async function testVendorServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB successfully');
    
    // Find all vendor accounts
    const vendors = await User.find({ role: 'vendor' });
    console.log(`Found ${vendors.length} vendor accounts`);
    
    // Check services for each vendor
    for (const vendor of vendors) {
      console.log(`\nVendor: ${vendor.name} (${vendor.email})`);
      
      // Count services for this vendor
      const serviceCount = await Service.countDocuments({ vendor: vendor._id });
      console.log(`  Services: ${serviceCount}`);
      
      if (serviceCount === 0) {
        console.log(`  Status: Needs initialization`);
      } else {
        console.log(`  Status: OK`);
        // List services
        const services = await Service.find({ vendor: vendor._id });
        services.forEach(service => {
          console.log(`    - ${service.name}: $${service.price}`);
        });
      }
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testVendorServices();