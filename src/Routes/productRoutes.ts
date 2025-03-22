import express, {Router, Request, Response, NextFunction} from 'express';
import { ProductController } from '../Controller/ProductController';

const router = express.Router();
const productController = new ProductController();

router.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    console.log('GET /rutas');
    try {
        await productController.getAll(req, res);
    } catch (error) {
        next(error);
    }
});

// Ruta para crear un nuevo producto
router.post('/products', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /products');
    try {
        await productController.create(req, res);  // Llama a la función de crear producto en el controlador
    } catch (error) {
        next(error);
    }
});
export default router;