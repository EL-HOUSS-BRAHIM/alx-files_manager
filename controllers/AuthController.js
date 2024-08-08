import redisClient from '../utils/redis.js';
import { usersCollection } from '../utils/db.js';
import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';

/**
 * AuthController handles user authentication.
 */
class AuthController {
  /**
   * getConnect - Authenticates a user and returns a token.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hashedPassword = sha1(password);
    const user = await usersCollection.findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 86400);

    return res.status(200).json({ token });
  }

  /**
   * getDisconnect - Logs out the authenticated user.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(key);
    return res.status(204).send();
  }
}

export default AuthController;
