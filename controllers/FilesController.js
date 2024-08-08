import { filesCollection, usersCollection } from '../utils/db.js';
import redisClient from '../utils/redis.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import mime from 'mime-types';

/**
 * FilesController handles file-related operations.
 */
class FilesController {
  /**
   * postUpload - Uploads a new file.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const { name, type, parentId, isPublic, data } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    let fileId = uuidv4();
    let filePath = '';

    if (type !== 'folder') {
      filePath = `${process.env.FOLDER_PATH}/${fileId}`;

      try {
        await fs.promises.mkdir(process.env.FOLDER_PATH, { recursive: true });
        await fs.promises.writeFile(filePath, Buffer.from(data, 'base64'));
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    const fileDocument = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      localPath: filePath,
    };

    await filesCollection.insertOne(fileDocument);

    res.status(201).json({
      id: fileId,
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    });
  }

  /**
   * getShow - Retrieves a file's details by ID.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await filesCollection.findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (file.userId !== userId && !file.isPublic) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(200).json(file);
  }

  /**
   * getIndex - Lists all files for the authenticated user.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getIndex(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const files = await filesCollection.find({ userId }).toArray();

    res.status(200).json(files);
  }

  /**
   * putPublish - Publishes a file.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await filesCollection.findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (file.userId !== userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    await filesCollection.updateOne({ _id: fileId }, { $set: { isPublic: true } });

    res.status(200).json({ id: fileId, isPublic: true });
  }

  /**
   * putUnpublish - Unpublishes a file.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await filesCollection.findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (file.userId !== userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    await filesCollection.updateOne({ _id: fileId }, { $set: { isPublic: false } });

    res.status(200).json({ id: fileId, isPublic: false });
  }
}

export default FilesController;
