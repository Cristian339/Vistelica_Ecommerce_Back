import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { URL } from 'url';  // Asegúrate de importar 'URL' desde 'url'

import { User } from '../Entities/User';
import { Products } from '../Entities/Products';
import { Category } from '../Entities/Category';
import { Subcategory } from '../Entities/Subcategory';
import { Review } from "../Entities/Review";
import { Profile } from "../Entities/Profile";
import { Order } from "../Entities/Order";
import { OrderDetail } from "../Entities/OrderDetail";
import { Wishlist } from "../Entities/Wishlist";
import {Payment} from "../Entities/Payment";
import {Supplier} from "../Entities/Supplier";

// Cargar variables de entorno
dotenv.config();

// Verificar si DATABASE_URL está definida
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definida en el archivo .env");
}

const url = new URL(databaseUrl); // Ahora puedes usar 'url' correctamente

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: url.hostname, // Extraer el host de la URL
    port: parseInt(url.port), // Extraer el puerto de la URL
    username: url.username, // Extraer el usuario de la URL
    password: url.password, // Extraer la contraseña de la URL
    database: url.pathname.split('/')[1],
    schema: 'vistelica',
    entities: [User, Profile, Products, Category, Subcategory, Review, Order, OrderDetail, Wishlist, Payment,Supplier],
    synchronize: true,
    logging: false,
    migrations: [],
    subscribers: [],
});

export default AppDataSource;
