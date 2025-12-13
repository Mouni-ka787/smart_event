const { MongoClient } = require('mongodb');

// Connection URL
const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';

// Database Name
const dbName = 'ewe';

// Create a new MongoClient
const client = new MongoClient(url);

// Connect to MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
        const db = client.db(dbName);
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

module.exports = { connectToMongo };