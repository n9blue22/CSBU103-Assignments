const { MongoClient } = require('mongodb');

// MongoDB URI and options
const uri = `// mongodb+srv://<mongodb_user>:<db_password>@chuongdlb-cluster.r27qr.mongodb.net/?retryWrites=true&w=majority&appName=chuongdlb-cluster
`; // Replace with your MongoDB connection string
const dbName = 'demo'; // Replace with your database name

let dbInstance;

async function connectToDb() {
  if (dbInstance) return dbInstance; // Return existing instance if already connected

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    dbInstance = client.db(dbName);
    return dbInstance;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

module.exports = { connectToDb };