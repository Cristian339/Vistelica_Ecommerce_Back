import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { ProductController } from '../Controller/ProductController';

const router = express.Router();
const productController = new ProductController();

// Configuración de Multer para la subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta interna donde se guardan las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Renombrar archivo con timestamp
    },
});
// Filtro para aceptar solo imágenes
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Verificamos si el archivo es una imagen (usando la propiedad mimetype)
    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/tiff', 'image/bmp', 'image/svg+xml'];

    if (imageMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error('Solo se permiten imágenes en formato válido (jpeg, jpg, png, webp, avif, gif, tiff, bmp, svg).'));
};

// Inicializar Multer
const upload = multer({ storage, fileFilter });

// Ruta para obtener todos los productos
router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    console.log('GET /products');
    try {
        await productController.getAll(req, res);
    } catch (error) {
        next(error);
    }
});

// Ruta para crear un nuevo producto con imagen
router.post('/products', upload.single('image'), (req, res) => {
    productController.create(req, res);  // Llamada al controlador para crear el producto
});



router.delete('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.delete(req, res);
    } catch (error) {
        next(error);
    }
});
router.get('/products/:productId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.getById(req, res);
    } catch (error) {
        next(error);
    }
});


router.put('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.update(req, res);
    } catch (error) {
        next(error);
    }
});
router.get('/products/category/:categoryId/subcategory/:subcategoryId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.getByCategoryAndSubcategory(req, res);
    } catch (error) {
        next(error);
    }
});
router.get("/product/:productId/price", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productController.getProductPriceWithDiscount(req, res);
    } catch (error) {
        next(error);
    }
});


export default router;