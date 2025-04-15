import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { ProductController } from '../Controller/ProductController';

const router = express.Router();
const productController = new ProductController();

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png',
        'image/webp', 'image/avif', 'image/gif',
        'image/tiff', 'image/bmp', 'image/svg+xml'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'));
    }
};

// Middleware de subida con Multer (hasta 10 imágenes por producto)
const uploadMultiple = multer({ storage, fileFilter }).array('images', 10);



// Obtener todos los productos
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.getAll(req, res);
    } catch (error) {
        next(error);
    }
});

// Crear producto con múltiples imágenes
router.post('/products', uploadMultiple, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.create(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar producto
router.delete('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.delete(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener producto por ID
router.get('/products/:productId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.getById(req, res);
    } catch (error) {
        next(error);
    }
});

// Cambiar estado a "descartado"
router.patch('/products/:productId/discard', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.changeModeDiscard(req, res);
    } catch (error) {
        next(error);
    }
});

// Actualizar producto
router.put('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.update(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener productos por categoría y subcategoría
router.get('/products/category/:categoryId/subcategory/:subcategoryId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.getByCategoryAndSubcategory(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener precio con descuento de un producto
router.get('/product/:productId/price', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.getProductPriceWithDiscount(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
