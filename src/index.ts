import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './Config/database'; // Importa la configuración de TypeORM
import productRoutes from './Routes/productRoutes'; // Importa las rutas de productos

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Usa las rutas
app.use('/api', productRoutes);

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