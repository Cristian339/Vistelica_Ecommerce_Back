import express from 'express';
import productRoutes from './productRoutes'; // Importa las rutas de productos
import cartRoutes from './cartRoutes'; // Importa las rutas del carrito

const router = express.Router();

// Combina las rutas de productos y carrito
router.use('/products', productRoutes); // Todas las rutas de productos tendrán el prefijo /products
router.use('/cart', cartRoutes); // Todas las rutas del carrito tendrán el prefijo /cart

export default router;