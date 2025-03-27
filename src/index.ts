import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './Config/database';
import ProductRoutes from './Routes/ProductRoutes';
import AuthRoutes from './Routes/AuthRoutes';
import ReviewRoutes from "./Routes/ReviewRoutes";
import ProfileRoutes from "./Routes/ProfileRoutes";
import OrderRoutes from "./Routes/OrderRoutes"; // Add this import
import "reflect-metadata";
import cors from 'cors';
import routes from './Routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares esenciales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usa las rutas
app.use('/api', ProductRoutes);
app.use('/api', AuthRoutes);
app.use('/api', ReviewRoutes);
app.use('/api', ProfileRoutes);
app.use('/api', OrderRoutes);
// Rutas con prefijo /api
app.use('/api', routes);

const start = async () => {
    try {
        // Conectar a la base de datos con TypeORM
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