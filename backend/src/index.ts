import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactRoutes from './routes/contacts';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(','), credentials: true }));
app.use(express.json({ limit: '5mb' }));

app.use('/api/contacts', contactRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
