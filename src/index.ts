import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database'; // Importa la configuración de TypeORM

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const start = async () => {
    try {
        // Conecta a la base de datos con TypeORM
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
