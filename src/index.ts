import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        await sequelize.sync({ force: false });
        console.log('Database synced');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

start();