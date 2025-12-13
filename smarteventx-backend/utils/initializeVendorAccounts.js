// Script to initialize vendor accounts by ensuring they have at least one service
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

async function initializeVendorAccounts() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://smartevent:smart123@cluster0.bfimhjm.mongodb.net/smarteventx?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");

    // Access the database and collections
    const db = client.db('smarteventx');
    const usersCollection = db.collection('users');
    const servicesCollection = db.collection('services');

    // Find all vendor users
    const vendors = await usersCollection.find({ role: 'vendor' }).toArray();
    
    console.log(`Found ${vendors.length} vendor accounts`);
    
    let initializedCount = 0;
    
    // Process each vendor
    for (const vendor of vendors) {
      // Check if vendor has any services
      const serviceCount = await servicesCollection.countDocuments({ vendor: vendor._id });
      
      if (serviceCount === 0) {
        // Create a sample service for the vendor
        const sampleService = {
          name: 'Sample Service',
          description: 'This is a sample service to get you started. Please update with your actual service details.',
          category: 'Other',
          price: 100,
          priceType: 'per_event',
          vendor: vendor._id,
          isActive: true,
          images: [],
          rating: 0,
          reviewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await servicesCollection.insertOne(sampleService);
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
    await client.close();
    console.log("\nDatabase connection closed");
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  initializeVendorAccounts();
}

module.exports = { initializeVendorAccounts };