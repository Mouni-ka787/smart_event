// Detailed test script to check vendor services
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

async function detailedTest() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB successfully');
    
    // Find the specific vendor by email
    const vendor = await User.findOne({ email: 'chetan@gmail.com', role: 'vendor' });
    if (!vendor) {
      console.log('Vendor not found');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`Vendor found: ${vendor.name} (${vendor.email})`);
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

detailedTest();