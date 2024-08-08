import express from 'express';
import AppController from '../controllers/AppController.js';
import AuthController from '../controllers/AuthController.js';
import UsersController from '../controllers/UsersController.js';
import FilesController from '../controllers/FilesController.js';

const router = express.Router();

// Route for checking status of Redis and MongoDB connections
router.get('/status', AppController.getStatus);

// Route for getting statistics about users and files
router.get('/stats', AppController.getStats);

// Route for user registration
router.post('/users', UsersController.postNew);

// Route for getting authenticated user's details
router.get('/users/me', UsersController.getMe);

// Route for user authentication
router.get('/connect', AuthController.getConnect);

// Route for logging out authenticated user
router.get('/disconnect', AuthController.getDisconnect);

// Route for uploading new files
router.post('/files', FilesController.postUpload);

// Route for retrieving a file's details
router.get('/files/:id', FilesController.getShow);

// Route for listing all files of the authenticated user
router.get('/files', FilesController.getIndex);

// Route for publishing a file
router.put('/files/:id/publish', FilesController.putPublish);

// Route for unpublishing a file
router.put('/files/:id/unpublish', FilesController.putUnpublish);

export default router;
