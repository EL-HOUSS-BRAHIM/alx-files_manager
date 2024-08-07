import express from 'express';
import routes from './routes/index.js';
import { connectDB } from './utils/db.js';

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
