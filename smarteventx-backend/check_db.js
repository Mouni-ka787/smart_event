// Simple script to check database connection and users
const { MongoClient } = require('mongodb');

async function checkDatabase() {
  const uri = "mongodb+srv://smartevent:smart123@cluster0.bfimhjm.mongodb.net/smarteventx?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");

    // Access the database and collection
    const db = client.db('smarteventx');
    const usersCollection = db.collection('users');

    // Count documents in users collection
    const userCount = await usersCollection.countDocuments();
    console.log(`\nTotal users in database: ${userCount}`);

    if (userCount === 0) {
      console.log("No users found. You need to register a user first.");
    } else {
      // Find all users
      const users = await usersCollection.find({}, { projection: { name: 1, email: 1, role: 1, createdAt: 1 } }).toArray();
      
      console.log('\n=== Users in Database ===');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt || 'N/A'}`);
        console.log('');
      });
      
      // Count users by role
      const userRoles = {};
      users.forEach(user => {
        const role = user.role || 'user';
        userRoles[role] = (userRoles[role] || 0) + 1;
      });
      
      console.log('=== Role Summary ===');
      Object.keys(userRoles).forEach(role => {
        console.log(`${role.charAt(0).toUpperCase() + role.slice(1)}s: ${userRoles[role]}`);
      });
    }

  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    await client.close();
    console.log("\nDatabase connection closed");
  }
}

checkDatabase();