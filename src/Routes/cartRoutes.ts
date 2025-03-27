// cartRoutes.ts
import express, {Router, Request, Response, NextFunction} from 'express';
import { ShoppingCartController } from '../Controller/ShoppingCartController';
import { ShoppingCartDetailController } from '../Controller/ShoppingCartDetailController';

const router = express.Router();
const shoppingCartDetailController = new ShoppingCartDetailController();
const shoppingCartController = new ShoppingCartController();

// Rutas principales del carrito
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.createOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.getCurrentOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/associate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.associateOrderToUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas para items del carrito
router.post('/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.addProductToOrder(req, res);
    } catch (error) {
        next(error);
    }
});

// En cartRoutes.ts
router.get('/items/:orderId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.getOrderDetails(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/items/:itemId/quantity', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.updateOrderDetailQuantity(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.removeProductFromOrder(req, res);
    } catch (error) {
        next(error);
    }
});

// Ruta para obtener el total del carrito
router.get('/total', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.getCartTotal(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;