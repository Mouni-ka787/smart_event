import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User';
import Service from './src/models/Service';

// Load environment variables
dotenv.config();

const testVendorSetup = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/smarteventx');
    console.log('Connected to database');
    
    // Get all vendors
    const vendors = await User.find({ role: 'vendor' });
    
    console.log('\n=== Vendor Accounts ===');
    console.log('Total vendors:', vendors.length);
    console.log('');
    
    if (vendors.length === 0) {
      console.log('No vendors found in the database.');
      console.log('Please register a vendor account first.');
    } else {
      for (const vendor of vendors) {
        console.log(`Vendor: ${vendor.name} (${vendor.email})`);
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
        
        console.log('');
      }
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testVendorSetup();