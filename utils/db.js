import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.DB_HOST || 'mongodb://localhost:27017');
const dbName = 'files_manager';
let db = null;

/**
 * Connect to the MongoDB database
 */
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}

// Export the collections for users and files
export const usersCollection = connectDB().then(db => db.collection('users'));
export const filesCollection = connectDB().then(db => db.collection('files'));
