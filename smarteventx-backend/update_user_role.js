// Script to update a user's role to vendor
const { MongoClient } = require('mongodb');

async function updateUserRole() {
  const uri = "mongodb+srv://smartevent:smart123@cluster0.bfimhjm.mongodb.net/smarteventx?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");

    // Access the database and collection
    const db = client.db('smarteventx');
    const usersCollection = db.collection('users');

    // You can change this email to the user you want to make a vendor
    const userEmail = process.argv[2] || 'user@example.com';
    
    console.log(`Looking for user with email: ${userEmail}`);
    
    // Find the user
    const user = await usersCollection.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`User with email ${userEmail} not found.`);
      console.log('\nAvailable users:');
      const users = await usersCollection.find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
      users.forEach((u, index) => {
        console.log(`${index + 1}. ${u.name} (${u.email}) - ${u.role}`);
      });
      return;
    }
    
    console.log(`Found user: ${user.name} (${user.email}) with role: ${user.role}`);
    
    if (user.role === 'vendor') {
      console.log('User is already a vendor.');
      return;
    }
    
    // Update the user's role to vendor
    const result = await usersCollection.updateOne(
      { email: userEmail },
      { $set: { role: 'vendor' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Successfully updated ${user.name} (${user.email}) to vendor role.`);
    } else {
      console.log('No changes were made.');
    }
    
    // Verify the update
    const updatedUser = await usersCollection.findOne({ email: userEmail });
    console.log(`Updated user role: ${updatedUser.role}`);

  } catch (error) {
    console.error("Error updating user role:", error);
  } finally {
    await client.close();
    console.log("\nDatabase connection closed");
  }
}

updateUserRole();