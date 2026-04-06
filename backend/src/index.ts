import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactRoutes from './routes/contacts';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const host = process.env.HOST || '0.0.0.0';
const jsonLimit = process.env.JSON_LIMIT || '20mb';

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(','), credentials: true }));
app.use(express.json({ limit: jsonLimit }));

app.use('/api/contacts', contactRoutes);

app.listen(Number(port), host, () => {
    console.log(`Server is running on ${host}:${port}`);
});
