import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { URL } from 'url';

import { User } from '../Entities/User';
import { Products } from '../Entities/Products';
import { Category } from '../Entities/Category';
import { Subcategory } from '../Entities/Subcategory';
import { Review } from "../Entities/Review";
import { Profile } from "../Entities/Profile";
import { Order } from "../Entities/Order";
import { OrderDetail } from "../Entities/OrderDetail";
import { Wishlist } from "../Entities/Wishlist";
import { Payment } from "../Entities/Payment";
import { Supplier } from "../Entities/Supplier";
import { ProductImage } from "../Entities/ProductImage";
import { AdditionalAddress } from "../Entities/Address";
import {Style} from "../Entities/Style";
import {StyleImage} from "../Entities/StyleImage";
import {PaymentMethod} from "../Entities/PaymentMethod";
import {Cart} from "../Entities/Cart";
import {CartDetail} from "../Entities/CartDetail";

// Cargar variables de entorno
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definida en el archivo .env");
}

const url = new URL(databaseUrl);

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    username: url.username,
    password: url.password,
    database: url.pathname.split('/')[1],
    schema: 'vistelica',
    entities: [User, Profile, Products, Category, Subcategory, Review, Order, OrderDetail, Wishlist, Payment, Supplier, ProductImage,AdditionalAddress, Style, StyleImage, PaymentMethod, Cart, CartDetail],
    synchronize: true,
    logging: false,
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false, // necesario para Render y conexiones TLS
        }
    }
});
