import { DataSource } from 'typeorm';
import { User } from '../Entities/User';
import { Products } from '../Entities/Products';
import {Category} from '../Entities/Category';
import {Subcategory} from '../Entities/Subcategory';
import {Review} from "../Entities/Review";
import {Profile} from "../Entities/Profile";

export const AppDataSource = new DataSource({
    type: 'postgres', // Base de datos Postgres
    host: 'localhost', // Dirección del host, puede ser localhost o la IP del servidor
    port: 5432, // Puerto de PostgreSQL
    username: 'postgres', // Usuario de la base de datos
    password: 'usuario', // Contraseña de la base de datos
    database: 'postgres', // Nombre de la base de datos
    schema: 'vistelica',
    entities: [User, Profile, Products, Category, Subcategory, Review],
    synchronize: true,
    logging: false,
    migrations: [],
    subscribers: [],
});

export default AppDataSource;
