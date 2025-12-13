// Final test script using the same connection method as the app
require('dotenv').config();
const mongoose = require('mongoose');

// Use the same MongoDB connection as the application
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/smarteventx";

// User/Vendor schema (matching the application)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Service schema (matching the application)
const serviceSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  price: Number,
  priceType: String,
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  images: [String],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);

async function finalTest() {
  try {
    // Connect to MongoDB using the same connection as the application
    await mongoose.connect(MONGODB_URL);
    console.log("Connected successfully to MongoDB");
    
    // List all users
    const allUsers = await User.find({});
    console.log(`\nTotal users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Find the specific vendor by email
    const vendor = await User.findOne({ email: 'chetan@gmail.com', role: 'vendor' });
    if (!vendor) {
      console.log('\nVendor not found');
      
      // Let's check if there's a user with this email regardless of role
      const userByEmail = await User.findOne({ email: 'chetan@gmail.com' });
      if (userByEmail) {
        console.log(`User found with email but role is: ${userByEmail.role}`);
      }
      
      await mongoose.connection.close();
      return;
    }
    
    console.log(`\nVendor found: ${vendor.name} (${vendor.email})`);
    console.log(`Vendor ID: ${vendor._id}`);
    
    // Count services for this vendor
    const serviceCount = await Service.countDocuments({ vendor: vendor._id });
    console.log(`Services count: ${serviceCount}`);
    
    if (serviceCount > 0) {
      // List services
      const services = await Service.find({ vendor: vendor._id });
      console.log('Services:');
      services.forEach(service => {
        console.log(`  - ${service.name}: $${service.price}`);
        console.log(`    ID: ${service._id}`);
        console.log(`    Category: ${service.category}`);
        console.log(`    Description: ${service.description}`);
      });
    } else {
      console.log('No services found for this vendor');
      
      // Let's check if there are any services at all in the database
      const totalServices = await Service.countDocuments();
      console.log(`Total services in database: ${totalServices}`);
      
      if (totalServices > 0) {
        console.log('All services in database:');
        const allServices = await Service.find().limit(5);
        allServices.forEach(service => {
          console.log(`  - ${service.name} (Vendor ID: ${service.vendor})`);
        });
      }
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

finalTest();