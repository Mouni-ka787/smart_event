// Script to create a new vendor user
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createVendor() {
  const uri = "mongodb+srv://smartevent:smart123@cluster0.bfimhjm.mongodb.net/smarteventx?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");

    // Access the database and collection
    const db = client.db('smarteventx');
    const usersCollection = db.collection('users');

    // Vendor details - you can modify these as needed
    const vendorEmail = process.argv[2] || 'newvendor@example.com';
    const vendorName = process.argv[3] || 'New Vendor';
    const vendorPassword = process.argv[4] || 'vendor123';
    
    console.log(`Creating vendor with email: ${vendorEmail}`);
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: vendorEmail });
    
    if (existingUser) {
      console.log(`User with email ${vendorEmail} already exists.`);
      console.log(`Current role: ${existingUser.role}`);
      
      if (existingUser.role !== 'vendor') {
        // Update role to vendor
        const result = await usersCollection.updateOne(
          { email: vendorEmail },
          { $set: { role: 'vendor' } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`Successfully updated ${existingUser.name} to vendor role.`);
        }
      } else {
        console.log('User is already a vendor.');
      }
      
      return;
    }
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(vendorPassword, saltRounds);
    
    // Create new vendor user
    const newVendor = {
      name: vendorName,
      email: vendorEmail,
      password: hashedPassword,
      role: 'vendor',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newVendor);
    
    if (result.insertedId) {
      console.log(`Successfully created vendor: ${vendorName} (${vendorEmail})`);
      console.log(`User ID: ${result.insertedId}`);
    } else {
      console.log('Failed to create vendor user.');
    }

  } catch (error) {
    console.error("Error creating vendor:", error);
  } finally {
    await client.close();
    console.log("\nDatabase connection closed");
  }
}

createVendor();