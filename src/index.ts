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
import SupplierRoutes from "./Routes/SupplierRoutes";
import WhishlistRoutes from "./Routes/WishlistRoutes";
import "reflect-metadata";
import cors from 'cors';
import CategoryRoutes from "./Routes/CategoryRoutes";
import colorDetectionRoutes from './Routes/colorDetectionRoutes';
import AddressRoutes from './Routes/AddressRoutes';
import StyleRoutes from './Routes/StyleRoutes';
import PaymentMethodRoutes from "./Routes/PaymentMethodRoutes";
import { AdminService } from './Service/AdminService';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware - agrega cabeceras y métodos permitidos
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const initializeBanScheduler = async () => {
    const adminService = new AdminService();

    // Verificar baneos expirados al iniciar
    await adminService.checkExpiredBans();

    // Programar verificación periódica cada 6 horas
    const CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 horas
    setInterval(() => {
        adminService.checkExpiredBans();
    }, CHECK_INTERVAL);

    console.log('Ban scheduler initialized');
};



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
app.use('/api', CategoryRoutes);
app.use('/api', SupplierRoutes);
app.use('/api', colorDetectionRoutes);
app.use('/api/addresses', AddressRoutes);
app.use('/api', PaymentMethodRoutes);
app.use('/api', StyleRoutes);
const start = async () => {
    try {
        // Conectar a la base de datos con TypeORM
        await AppDataSource.initialize();
        console.log('Database connected successfully');

        // Inicializar el scheduler de baneos
        await initializeBanScheduler();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

start();