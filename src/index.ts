import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './Config/database';
import productRoutes from './Routes/productRoutes';
import authRoutes from './Routes/authRoutes'; // Add this import

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Use routes
app.use('/api', productRoutes);
app.use('/api', authRoutes);

const start = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

start();