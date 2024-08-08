import redisClient from '../utils/redis.js';
import { usersCollection, filesCollection } from '../utils/db.js';

/**
 * AppController handles the basic application routes.
 */
class AppController {
  /**
   * getStatus - Returns the status of Redis and MongoDB connections.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getStatus(req, res) {
    const redisStatus = await redisClient.ping();  // Check Redis connection status
    const dbStatus = (await usersCollection.findOne()) !== null;  // Check MongoDB connection status
    res.status(200).json({ redis: redisStatus === 'PONG', db: dbStatus });
  }

  /**
   * getStats - Returns the count of users and files in the database.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getStats(req, res) {
    const usersCount = await usersCollection.countDocuments();  // Count number of users
    const filesCount = await filesCollection.countDocuments();  // Count number of files
    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

export default AppController;
