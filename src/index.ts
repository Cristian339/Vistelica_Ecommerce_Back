import express from 'express';
import dotenv from 'dotenv';
import "reflect-metadata";
import cors from 'cors';
import { AppDataSource } from './Config/database';
import routes from './Routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares esenciales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas con prefijo /api
app.use('/api', routes);

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