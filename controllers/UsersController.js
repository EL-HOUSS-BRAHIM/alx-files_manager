import { usersCollection } from '../utils/db.js';
import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';

/**
 * UsersController handles user-related operations.
 */
class UsersController {
  /**
   * postNew - Creates a new user.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = {
      email,
      password: hashedPassword,
    };

    await usersCollection.insertOne(newUser);

    res.status(201).json({
      id: newUser._id,
      email: newUser.email,
    });
  }

  /**
   * getMe - Retrieves the authenticated user's details.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
    });
  }
}

export default UsersController;
