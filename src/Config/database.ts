import { DataSource } from 'typeorm';
import { User } from '../Entities/User';
import { Product } from '../Entities/Product';
import {Category} from '../Entities/Category';
import {Subcategory} from '../Entities/Subcategory';

export const AppDataSource = new DataSource({
    type: 'postgres', // Base de datos Postgres
    host: 'localhost', // Dirección del host, puede ser localhost o la IP del servidor
    port: 5432, // Puerto de PostgreSQL
    username: 'postgres', // Usuario de la base de datos
    password: 'root', // Contraseña de la base de datos
    database: 'postgres', // Nombre de la base de datos
    entities: [User, Product, Category, Subcategory],
    synchronize: true,
    logging: false,
    migrations: [],
    subscribers: [],
});

export default AppDataSource;
