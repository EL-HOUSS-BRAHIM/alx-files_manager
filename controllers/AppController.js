import redisClient from '../utils/redis.js';
import { usersCollection, filesCollection } from '../utils/db.js';

class AppController {
  static async getStatus(req, res) {
    const redisStatus = await redisClient.ping();
    const dbStatus = (await usersCollection.findOne()) !== null;
    res.status(200).json({ redis: redisStatus === 'PONG', db: dbStatus });
  }

  static async getStats(req, res) {
    const usersCount = await usersCollection.countDocuments();
    const filesCount = await filesCollection.countDocuments();
    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

export default AppController;
