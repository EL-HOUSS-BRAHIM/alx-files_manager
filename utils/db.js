import { MongoClient } from 'mongodb';
import { promisify } from 'util';

const client = new MongoClient('mongodb://localhost:27017');

const connectDB = async () => {
  await client.connect();
  console.log('Connected to MongoDB');
};

const db = client.db('files_manager');

const usersCollection = db.collection('users');
const filesCollection = db.collection('files');

export { connectDB, usersCollection, filesCollection };
