import express from 'express';
import router from './routes/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());  // Middleware to parse JSON bodies
app.use('/api', router);  // Mount the router at /api

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
