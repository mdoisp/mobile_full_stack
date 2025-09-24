import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import studentRouter from './routes/student.routes.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is not set in .env file');
    process.exit(1);
}

mongoose.connect(databaseUrl).then(() => {
    console.log('Succefully connected to MongoDB ☘️')
})
.catch((err) => {
    console.error('MongoDB connection failure: ', err)
})

app.use('/students', studentRouter);

app.get('/', (req, res) => {
    res.send ('Server working correctly');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
