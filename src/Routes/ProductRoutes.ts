import express, { Request, Response, NextFunction } from 'express';
import { uploadMultiple } from '../Middleware/UploadMiddleware';
import { ProductController } from '../Controller/ProductController';

const router = express.Router();
const productController = new ProductController();

// Obtener todos los productos
router.get('/products', async (req, res, next) => {
    try {
        await productController.getAll(req, res);
    } catch (error) {
        next(error);
    }
});

// Crear producto con múltiples imágenes
router.post('/products', uploadMultiple, async (req, res, next) => {
    try {
        await productController.create(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar producto
router.delete('/products/:id', async (req, res, next) => {
    try {
        await productController.delete(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener producto por ID
router.get('/products/:productId', async (req, res, next) => {
    try {
        await productController.getById(req, res);
    } catch (error) {
        next(error);
    }
});

// Cambiar estado a "descartado"
router.patch('/products/:productId/discard', async (req, res, next) => {
    try {
        await productController.changeModeDiscard(req, res);
    } catch (error) {
        next(error);
    }
});

// Actualizar producto
router.put('/products/:id', async (req, res, next) => {
    try {
        await productController.update(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener productos por categoría y subcategoría
router.get('/products/category/:categoryId/subcategory/:subcategoryId', async (req, res, next) => {
    try {
        await productController.getByCategoryAndSubcategory(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener precio con descuento de un producto
router.get('/product/:productId/price', async (req, res, next) => {
    try {
        await productController.getProductPriceWithDiscount(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
