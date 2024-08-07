import { ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';
import { filesCollection } from '../utils/db.js';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, parentId = 0, isPublic = false, data } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

    let parentFile = null;
    if (parentId !== 0) {
      parentFile = await filesCollection.findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const fileData = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? 0 : new ObjectId(parentId),
    };

    if (type === 'folder') {
      const result = await filesCollection.insertOne(fileData);
      return res.status(201).json({ id: result.insertedId, ...fileData });
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    await fs.mkdir(folderPath, { recursive: true });

    const fileName = uuidv4();
    const filePath = path.join(folderPath, fileName);

    await fs.writeFile(filePath, Buffer.from(data, 'base64'));

    fileData.localPath = filePath;

    const result = await filesCollection.insertOne(fileData);
    res.status(201).json({ id: result.insertedId, ...fileData });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const file = await filesCollection.findOne({ _id: new ObjectId(req.params.id), userId: new ObjectId(userId) });
    if (!file) return res.status(404).json({ error: 'Not found' });

    res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { parentId = 0, page = 0 } = req.query;
    const pageSize = 20;
    const skip = page * pageSize;

    const files = await filesCollection.find({ parentId: parentId === 0 ? 0 : new ObjectId(parentId), userId: new ObjectId(userId) }).skip(skip).limit(pageSize).toArray();
    res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const file = await filesCollection.findOne({ _id: new ObjectId(req.params.id), userId: new ObjectId(userId) });
    if (!file) return res.status(404).json({ error: 'Not found' });

    await filesCollection.updateOne({ _id: file._id }, { $set: { isPublic: true } });

    res.status(200).json({ id: file._id, isPublic: true });
  }

  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const file = await filesCollection.findOne({ _id: new ObjectId(req.params.id), userId: new ObjectId(userId) });
    if (!file) return res.status(404).json({ error: 'Not found' });

    await filesCollection.updateOne({ _id: file._id }, { $set: { isPublic: false } });

    res.status(200).json({ id: file._id, isPublic: false });
  }
}

export default FilesController;
