
import express, { Request, Response, NextFunction} from 'express';
import { ShoppingCartController } from '../Controller/ShoppingCartController';
import { ShoppingCartDetailController } from '../Controller/ShoppingCartDetailController';

const router = express.Router();
const shoppingCartDetailController = new ShoppingCartDetailController();
const shoppingCartController = new ShoppingCartController();

// Rutas principales del carrito
router.post('/cart/', async (req: Request, res: Response, next: NextFunction) => {

    try {
        await shoppingCartDetailController.createOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/cart/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.getCurrentOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/cart/associate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.associateOrderToUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas para items del carrito
router.post('/cart/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.addProductToOrder(req, res);
    } catch (error) {
        next(error);
    }
});

// En CartRoutes.ts
router.get('/cart/items/:orderId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.getOrderDetails(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/cart/items/:itemId/quantity', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.updateOrderDetailQuantity(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/cart/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.removeProductFromOrder(req, res);
    } catch (error) {
        next(error);
    }
});

// Ruta para obtener el total del carrito
router.get('/cart/total', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.getCartTotal(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;