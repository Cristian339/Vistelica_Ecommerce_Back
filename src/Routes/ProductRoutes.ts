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

// Rutas para obtener imágenes principales
router.get('/products/images/main', async (req, res, next) => {
    try {
        await productController.getMainProductImages(req, res);
    } catch (error) {
        next(error);
    }
});

// Ruta con ID específico antes que rutas con parámetros dinámicos similares
router.get('/products/:productId/image/main', async (req, res, next) => {
    try {
        await productController.getMainImageByProductId(req, res);
    } catch (error) {
        next(error);
    }
});

// Ruta para obtener todas las imágenes de un producto
router.get('/products/:productId/images', async (req, res, next) => {
    try {
        await productController.getAllImagesByProductId(req, res);
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


// Nuevas rutas para las funcionalidades de productos
router.get('/products/:productName/sizes', async (req, res, next) => {
    try {
        await productController.getSizesByName(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/products/:productName/:size/colors', async (req, res, next) => {
    try {
        await productController.getColorsByNameAndSize(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/products/:productName/:size/:color', async (req, res, next) => {
    try {
        await productController.getProductByNameSizeColor(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/products/:productName/variants', async (req, res, next) => {
    try {
        await productController.getProductVariants(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener productos destacados aleatorios
router.get('/products/featured/random', async (req, res, next) => {
    try {
        await productController.getRandomFeaturedProducts(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/products/featured/top-rated', async (req, res, next) => {
    try {
        await productController.getTopRatedFeaturedProducts(req, res);
    } catch (error) {
        next(error);
    }
});
router.get('/products/featured/accessories', async (req, res, next) => {
    try {
        await productController.getRandomAccessoryProducts(req, res);
    } catch (error) {
        next(error);
    }
});


// Añadir esta ruta al final del archivo, antes del export default router

// Ruta para búsqueda de productos
router.post('/products/search', async (req, res, next) => {
    try {
        await productController.searchProducts(req, res);
    } catch (error) {
        next(error);
    }
});

// Ruta para búsqueda de productos
router.post('/products/basic-info', async (req, res, next) => {
    try {
        await productController.getProductsWithBasicInfo(req, res);
    } catch (error) {
        next(error);
    }
});


export default router;