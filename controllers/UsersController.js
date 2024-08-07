import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import { usersCollection } from '../utils/db.js';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });

    const user = await usersCollection.findOne({ email });
    if (user) return res.status(400).json({ error: 'Already exist' });

    const hashedPassword = sha1(password);
    const result = await usersCollection.insertOne({ email, password: hashedPassword });
    res.status(201).json({ id: result.insertedId, email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
