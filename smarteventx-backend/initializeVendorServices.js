// Script to initialize vendor services for testing
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
  priceType: String,
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);

async function initializeVendorServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB successfully');
    
    // Find all vendor accounts
    const vendors = await User.find({ role: 'vendor' });
    console.log(`Found ${vendors.length} vendor accounts`);
    
    if (vendors.length === 0) {
      console.log('No vendor accounts found. Please create a vendor account first.');
      return;
    }
    
    // Sample services to create for each vendor
    const sampleServices = [
      {
        name: "Premium Catering Package",
        description: "Full-service catering with customizable menu options for any event size.",
        category: "Food & Beverage",
        price: 75,
        priceType: "per_person"
      },
      {
        name: "Professional Photography Session",
        description: "High-quality photography coverage for weddings, corporate events, and special occasions.",
        category: "Photography",
        price: 500,
        priceType: "per_event"
      },
      {
        name: "Complete Event Decoration",
        description: "Full decoration package including floral arrangements, lighting, and themed setups.",
        category: "Decoration",
        price: 1200,
        priceType: "per_event"
      },
      {
        name: "Sound System Rental",
        description: "Professional audio equipment rental with technician support.",
        category: "Audio/Visual",
        price: 300,
        priceType: "per_event"
      }
    ];
    
    // Create services for each vendor
    for (const vendor of vendors) {
      console.log(`\nInitializing services for vendor: ${vendor.name} (${vendor.email})`);
      
      // Check if vendor already has services
      const existingServiceCount = await Service.countDocuments({ vendor: vendor._id });
      if (existingServiceCount > 0) {
        console.log(`  Vendor already has ${existingServiceCount} services. Skipping.`);
        continue;
      }
      
      // Create sample services for this vendor
      for (const serviceData of sampleServices) {
        const service = new Service({
          ...serviceData,
          vendor: vendor._id
        });
        
        await service.save();
        console.log(`  Created service: ${service.name}`);
      }
      
      console.log(`  Successfully initialized ${sampleServices.length} services for ${vendor.name}`);
    }
    
    console.log('\nVendor service initialization complete!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

initializeVendorServices();