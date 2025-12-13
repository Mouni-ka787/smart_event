// Script to initialize vendor accounts by ensuring they have at least one service
// Fixed version that uses the same MongoDB connection as the application
const mongoose = require('mongoose');
require('dotenv').config();

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

async function initializeVendorAccounts() {
  try {
    // Connect to MongoDB using the same connection as the application
    await mongoose.connect(MONGODB_URL);
    console.log("Connected successfully to MongoDB");

    // Find all vendor users
    const vendors = await User.find({ role: 'vendor' });
    
    console.log(`Found ${vendors.length} vendor accounts`);
    
    let initializedCount = 0;
    
    // Process each vendor
    for (const vendor of vendors) {
      // Check if vendor has any services
      const serviceCount = await Service.countDocuments({ vendor: vendor._id });
      
      if (serviceCount === 0) {
        // Create a sample service for the vendor
        const sampleService = new Service({
          name: 'Sample Service',
          description: 'This is a sample service to get you started. Please update with your actual service details.',
          category: 'Other',
          price: 100,
          priceType: 'per_event',
          vendor: vendor._id,
          isActive: true,
          images: [],
          rating: 0,
          reviewCount: 0
        });
        
        await sampleService.save();
        console.log(`Created sample service for vendor: ${vendor.name} (${vendor.email})`);
        initializedCount++;
      } else {
        console.log(`Vendor ${vendor.name} (${vendor.email}) already has ${serviceCount} services`);
      }
    }
    
    console.log(`Initialized ${initializedCount} vendor accounts with sample services`);

  } catch (error) {
    console.error("Error initializing vendor accounts:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  initializeVendorAccounts();
}

module.exports = { initializeVendorAccounts };