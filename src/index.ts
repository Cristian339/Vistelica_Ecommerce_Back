import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './Config/database';
import ProductRoutes from './Routes/ProductRoutes';
import AuthRoutes from './Routes/AuthRoutes';
import ReviewRoutes from "./Routes/ReviewRoutes";
import ProfileRoutes from "./Routes/ProfileRoutes";
import OrderRoutes from "./Routes/OrderRoutes";
import CartRoutes from "./Routes/CartRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import WhishlistRoutes from "./Routes/WishlistRoutes";
import "reflect-metadata";
import cors from 'cors';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares esenciales
app.use(express.json());

// Usa las rutas
app.use('/api', ProductRoutes);
app.use('/api', AuthRoutes);
app.use('/api', ReviewRoutes);
app.use('/api', ProfileRoutes);
app.use('/api', OrderRoutes);
app.use('/api', CartRoutes);
app.use('/api', AdminRoutes);
app.use('/api', WhishlistRoutes);

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